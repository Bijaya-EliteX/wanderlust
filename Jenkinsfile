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
        stage('Run Tests & Generate Coverage') {
            steps {
                sh '''
                    echo "=== Backend Tests ==="
                    cd backend
                    npx jest --coverage --runInBand --forceExit --passWithNoTests --detectOpenHandles --coverageReporters=lcov --coverageReporters=text --coverageDirectory=coverage || true
                    echo "Backend coverage exit: $?"
                    ls -lh coverage/lcov.info || ls -lh backend/coverage/lcov.info || echo "backend lcov not found"
                    cd ..

                    echo "=== Frontend Tests ==="
                    cd frontend
                    npx vitest run --coverage --coverage.reportsDirectory=coverage --coverage.reporter=lcov --coverage.reporter=text --reporter=verbose || true
                    echo "Frontend coverage exit: $?"
                    ls -lh coverage/lcov.info || echo "frontend lcov not found"
                    cd ..
                    
                    echo "=== Coverage Reports ==="
                    ls -lh backend/coverage/lcov.info || echo "backend lcov missing"
                    ls -lh frontend/coverage/lcov.info || echo "frontend lcov missing"
                    cat backend/coverage/lcov.info 2>&1 | head -20 || echo "no backend lcov"
                    cat frontend/coverage/lcov.info 2>&1 | head -20 || echo "no frontend lcov"
                '''
            }
        }
        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'sonar-scanner'
                    withSonarQubeEnv('sonar-server') {
                        sh """
                            echo "SONAR_HOST_URL = \$SONAR_HOST_URL"
                            echo "Scanner = ${scannerHome}"
                            ${scannerHome}/bin/sonar-scanner \
                            -Dsonar.host.url=\$SONAR_HOST_URL \
                            -Dsonar.projectKey=wanderlust \
                            -Dsonar.projectName=wanderlust \
                            -Dsonar.sources=. \
                            -Dsonar.exclusions=**/node_modules/**,**/coverage/**,**/dist/**,**/*.test.ts,**/*.test.tsx,**/__tests__/**,**/tests/** \
                            -Dsonar.javascript.lcov.reportPaths=backend/coverage/lcov.info,frontend/coverage/lcov.info \
                            -Dsonar.typescript.lcov.reportPaths=backend/coverage/lcov.info,frontend/coverage/lcov.info \
                            -Dsonar.coverage.exclusions=**/*.test.ts,**/*.test.tsx,**/__tests__/**,**/tests/**,**/vite.config.ts,**/jest.config.ts
                        """
                    }
                }
            }
        }
        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: false
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
                            docker compose up -d --build --remove-orphans
                            echo \"Waiting for mongo/backend...\"
                            sleep 10
                            COUNT=\$(docker exec wanderlust-mongo mongosh --quiet --eval 'db.getSiblingDB("wanderlust").posts.countDocuments()' || echo 0)
                            echo \"Posts count: \$COUNT\"
                            if [ \"\$COUNT\" -eq 0 ]; then
                              echo \"Seeding original data from backend/data/sample_posts.json...\"
                              docker cp backend/data/sample_posts.json wanderlust-mongo:/tmp/sample_posts.json
                              docker exec wanderlust-mongo mongoimport --db wanderlust --collection posts --file /tmp/sample_posts.json --jsonArray || true
                              docker exec wanderlust-redis redis-cli FLUSHALL || true
                              docker restart wanderlust-backend || true
                              sleep 5
                            fi
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
