pipeline {
    agent any
    
    tools {
        nodejs 'node20'
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
                            // Use the actual SonarQube server IP (same as in deployment.yaml)
                            sh "${scannerHome}/bin/sonar-scanner \
                                -Dsonar.projectKey=banking-app \
                                -Dsonar.sources=src \
                                -Dsonar.host.url=http://172.31.47.1:9000 \
                                -Dsonar.token=${SONAR_TOKEN}"
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
                // 1. Run scan and show results in Jenkins Console (Table format)
                sh 'trivy image --severity HIGH,CRITICAL jeevanc370/banking-app:latest'

                // 2. Run scan again to generate JSON for System Health Dashboard
                sh 'trivy image --format json --output trivy-report.json jeevanc370/banking-app:latest'
                
                // Note: Webhook will be sent AFTER deployment when backend is running
            }
        }

        stage('Deploy to K8s') {
            steps {
                dir('Ansible') {
                    sh 'ansible-playbook k8s.yaml'
                }
            }
        }

        stage('Send Trivy Report to Dashboard') {
            steps {
                // Wait for backend pod to be ready
                sh 'sleep 15'
                
                // Try both worker node IPs (pod could be on either node)
                sh '''
                    echo "Sending Trivy report to backend..."
                    curl -X POST -H 'Content-Type: application/json' -d @trivy-report.json http://172.31.33.228:30008/api/trivy-webhook && echo "Sent to 172.31.33.228" || \
                    curl -X POST -H 'Content-Type: application/json' -d @trivy-report.json http://172.31.41.58:30008/api/trivy-webhook && echo "Sent to 172.31.41.58" || \
                    echo "Warning: Could not send Trivy report to backend"
                '''
            }
        }
    }
}