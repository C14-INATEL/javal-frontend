pipeline {

    agent any

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '5', artifactNumToKeepStr: '5'))
        timestamps()
        ansiColor('xterm')
        disableConcurrentBuilds()
    }

    environment {
        NOME_PIPELINE = 'javal-frontend - CI (lint, testes, build, docker)'
    }

    stages {

        stage('Instalar dependências') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Qualidade') {
            parallel {
                stage('ESLint') {
                    steps {
                        sh 'npm run lint'
                    }
                    post {
                        success { echo 'ESLint: sem problemas reportados.' }
                        failure { echo 'ESLint: violações encontradas.' }
                    }
                }
                stage('Testes (Vitest)') {
                    steps {
                        sh 'npm run test'
                    }
                    post {
                        success { echo 'Vitest: todos os testes passaram.' }
                        failure { echo 'Vitest: falhas nos testes.' }
                    }
                }
            }
        }

        stage('Build (TypeScript + Vite)') {
            steps {
                sh 'npm run build'
            }
            post {
                success { echo 'Build concluído com sucesso.' }
                failure { echo 'Build falhou (tsc ou vite).' }
            }
        }

        stage('Build Docker') {
            steps {
                sh 'docker build -t javal-frontend:prod .'
            }
            post {
                success { echo 'Imagem Docker criada com sucesso.' }
                failure { echo 'Falha ao criar imagem Docker.' }
            }
        }
    }

    post {
        success { echo 'Pipeline concluído com SUCESSO.' }
        failure { echo 'Pipeline FALHOU. Verifique os logs acima.' }
        unstable { echo 'Pipeline INSTÁVEL.' }
        always {
            echo "Pipeline: ${env.NOME_PIPELINE ?: 'javal-frontend'}"
            echo "Build: #${BUILD_NUMBER}"
            echo "Resultado: ${currentBuild.currentResult}"
            echo "Duração: ${currentBuild.durationString}"
        }
    }
}