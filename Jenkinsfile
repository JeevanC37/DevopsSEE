pipeline {
    agent any
    
    tools {
        // Must match the name you gave in Jenkins Global Tools Config
        nodejs 'node16' 
    }
    
    environment {
        // This makes the docker hub password available as a variable
        DOCKER_CREDS = credentials('docker-hub-creds')
    }

    stages {
        stage('Checkout') {
            steps {
                // Pulls code from your 'main' branch
                git branch: 'main', url: 'https://github.com/JeevanC37/DevopsSEE.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                // Installs packages so we can run tests
                // We use 'frontend' folder because your Dockerfile uses it
                dir('frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('Test') {
            steps {
                dir('frontend') {
                    // This runs the React tests
                    // We add --passWithNoTests just in case to prevent failure if empty
                    sh 'npm test -- --watchAll=false --passWithNoTests'
                }
            }
        }

        stage('Build & Push Image (Ansible)') {
            steps {
                // This runs your Ansible playbook to Build and Push Docker Image
                dir('Ansible') {
                    // We pass the Docker creds to Ansible just in case, 
                    // though your playbook might have them hardcoded (which is less secure but works for now)
                    sh 'ansible-playbook docker.yaml'
                }
            }
        }

        stage('Deploy to K8s (Ansible)') {
            steps {
                // This runs your Ansible playbook to Deploy to Kubernetes
                dir('Ansible') {
                    sh 'ansible-playbook k8s.yaml'
                }
            }
        }
    }
}