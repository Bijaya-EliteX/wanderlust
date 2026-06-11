pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Setup .env Files') {
            steps {
                sh '''
                    cp backend/.env.sample backend/.env
                    cp frontend/.env.sample frontend/.env
                '''
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm run installer'
            }
        }
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh '''
                        npx sonar-scanner \
                        -Dsonar.projectKey=wanderlust \
                        -Dsonar.projectName=wanderlust \
                        -Dsonar.sources=. \
                        -Dsonar.exclusions=**/node_modules/**
                    '''
                }
            }
        }
        stage('OWASP Dependency Check') {
            steps {
                withCredentials([string(credentialsId: 'nvd-api', variable: 'NVD_API_KEY')]) {
                    dependencyCheck additionalArguments: "--scan ./ --format HTML --format XML --out ./dependency-check-report --nvdApiKey " + NVD_API_KEY, odcInstallation: 'OWASP-DC'
                }
            }
            post {
                always {
                    dependencyCheckPublisher pattern: 'dependency-check-report/dependency-check-report.xml'
                }
            }
        }
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }
    }
    post {
        success {
            echo ' Build successful!'
        }
        failure {
            echo ' Build failed. Check logs.'
        }
        always {
            cleanWs()
        }
    }
}
