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

        stage('OWASP Dependency Check') {
            steps {
                dependencyCheck additionalArguments: '--scan ./ --format HTML --format XML --out ./dependency-check-report', odcInstallation: 'OWASP-DC'
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
            echo '✅ Build successful!'
        }
        failure {
            echo '❌ Build failed. Check logs.'
        }
        always {
            cleanWs()
        }
    }
}
