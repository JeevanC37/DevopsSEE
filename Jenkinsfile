pipeline {
    agent any
    
    tools {
        nodejs 'node20'
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
                // Wait for pod rollout to complete and stabilize
                sh '''
                    echo "Waiting for backend deployment to stabilize..."
                    sleep 45
                    
                    echo "Sending Trivy report to backend..."
                    # Try multiple times with delay to ensure pod is ready
                    for i in 1 2 3; do
                        if curl -sf -X POST -H 'Content-Type: application/json' -d @trivy-report.json http://172.31.33.228:30008/api/trivy-webhook; then
                            echo "SUCCESS: Trivy report sent to 172.31.33.228"
                            exit 0
                        elif curl -sf -X POST -H 'Content-Type: application/json' -d @trivy-report.json http://172.31.41.58:30008/api/trivy-webhook; then
                            echo "SUCCESS: Trivy report sent to 172.31.41.58"
                            exit 0
                        fi
                        echo "Attempt $i failed, waiting 10 seconds..."
                        sleep 10
                    done
                    echo "Warning: Could not send Trivy report to backend after 3 attempts"
                '''
            }
        }
    }
}