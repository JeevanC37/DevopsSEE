pipeline {
    agent any
    
    tools {
        nodejs 'node16'
        // REMOVED sonarScanner from here to fix the error
    }
    
    environment {
        DOCKER_CREDS = credentials('docker-hub-creds')
        SONAR_TOKEN = credentials('sonar-token') 
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/JeevanC37/DevopsSEE.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('Test') {
            steps {
                dir('frontend') {
                    sh 'npm test -- --watchAll=false --passWithNoTests'
                }
            }
        }

        stage('SonarQube Analysis (SAST)') {
            steps {
                script {
                    // Fix: Find the scanner tool manually using the name you gave in Global Tools
                    def scannerHome = tool 'sonar-scanner'
                    
                    dir('frontend') {
                        withSonarQubeEnv('sonar-server') { 
                            sh "${scannerHome}/bin/sonar-scanner \
                                -Dsonar.projectKey=banking-app \
                                -Dsonar.sources=src \
                                -Dsonar.host.url=http://localhost:9000 \
                                -Dsonar.login=${SONAR_TOKEN}"
                        }
                    }
                }
            }
        }

        stage('Build & Push Image') {
            steps {
                dir('Ansible') {
                    sh 'ansible-playbook docker.yaml'
                }
            }
        }

        stage('Vulnerability Scan (Trivy)') {
            steps {
                sh 'trivy image --severity HIGH,CRITICAL jeevanc370/banking-app:latest'
            }
        }

        stage('Deploy to K8s') {
            steps {
                dir('Ansible') {
                    sh 'ansible-playbook k8s.yaml'
                }
            }
        }
    }
}