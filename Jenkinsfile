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
        script {
            def scannerHome = tool 'sonar-scanner'

            withSonarQubeEnv('sonar-server') {
                sh """
                    ${scannerHome}/bin/sonar-scanner \
                    -Dsonar.projectKey=wanderlust \
                    -Dsonar.projectName=wanderlust \
                    -Dsonar.sources=. \
                    -Dsonar.exclusions=**/node_modules/**
                """
            }
        }
    }
}
        stage('Quality Gate') {
            steps {
                waitForQualityGate abortPipeline: true
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
        stage('Build Images') {
            steps {
                sh 'docker compose build'
            }
        }
        stage('Deploy to Docker Host') {
            steps {
                sshagent(['docker-ssh-key']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no ubuntu@172.31.44.133 "
                            set -e
                            echo \\"Connected to: \\$(hostname) (\\$(hostname -f))\\"
                            if [ ! -d ~/wanderlust ]; then
                                git clone https://github.com/Bijaya-EliteX/wanderlust.git ~/wanderlust
                            fi
                            cd ~/wanderlust
                            git pull origin main
                            cp -n backend/.env.sample backend/.env || true
                            docker compose down || true
                            docker compose up -d --build
                            docker compose ps
                            docker ps --format \\"table {{.Names}}\\\\t{{.Status}}\\\\t{{.Ports}}\\\"
                        "
                    '''
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
