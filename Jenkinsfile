pipeline {
    agent any
    
    tools {
        nodejs 'node16'
        // This name must match 'Manage Jenkins' -> 'Tools' -> 'SonarQube Scanner'
        sonarScanner 'sonar-scanner' 
    }
    
    environment {
        DOCKER_CREDS = credentials('docker-hub-creds')
        // Connects to the token we just saved
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
                dir('frontend') {
                    // Uses the 'sonar-server' we configured in Step 3
                    withSonarQubeEnv('sonar-server') { 
                        sh "sonar-scanner \
                            -Dsonar.projectKey=banking-app \
                            -Dsonar.sources=src \
                            -Dsonar.host.url=http://localhost:9000 \
                            -Dsonar.login=${SONAR_TOKEN}"
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
                // Scans the Docker image for High/Critical vulnerabilities
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