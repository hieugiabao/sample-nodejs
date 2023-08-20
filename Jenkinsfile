pipeline {
    agent any
    environment {
        REGISTRY                    = credentials('REGISTRY')
        DOCKER_REGISTRY_USERNAME    = credentials('DOCKER_REGISTRY_USERNAME')
        DOCKER_REGISTRY_PASSWORD    = credentials('DOCKER_REGISTRY_PASSWORD')
        GITHUB_CREDS                = credentials('GITHUB_CREDS')
    }

    stages {
        // stage('Clone Sample NodeJS Project') {
        //     steps {
        //         checkout([$class: 'GitSCM',
        //             branches: [[name: '*/master']],
        //             extensions: scm.extensions,
        //             userRemoteConfigs: [[
        //                 url: 'https://github.com/hieugiabao/sample-nodejs.git',
        //                 credentialsId: 'GITHUB_CREDS'
        //             ]]
        //         ])
        //     }
        // }

        stage('Get GIT_COMMIT') {
            steps {
                script {
                    def GIT_COMMIT = sh(returnStdout: true, script: "git log -n 1 --pretty=format:'%h'").trim()
                }
            }
        }

        stage('docker-build') {
            options {
                timeout(time: 30, unit: 'MINUTES')
            }
            steps {
                sh '''#!/usr/bin/env bash
                echo "Shell Process ID: $$"
                docker login --username $DOCKER_REGISTRY_USERNAME --password $DOCKER_REGISTRY_PASSWORD
                echo Branch: ${BRANCH_NAME}
                echo Git commit: ${GIT_COMMIT}
                docker build --tag ${REGISTRY}/nodejs-demo:${BRANCH_NAME}-${GIT_COMMIT} .
                docker push ${REGISTRY}/nodejs-demo:${BRANCH_NAME}-${GIT_COMMIT}
                '''
            }
        }

        stage('Clone Helm Chart repo') {
            steps {
                dir('argo-cd') {
                    git branch: 'main', credentialsId: 'GITHUB_CREDS', url: 'https://github.com/hieugiabao/sampleapp-agrocd'
                    sh '''#!/usr/bin/env bash
                        git config --global user.email "jenkins-ci@github.com"
                        git config --global user.name "jenkins-ci"
                    '''
                }
            }
        }

        stage('Deploy DEV') {
            when {
                branch 'dev'
            }
            steps {
                sh '''#!/usr/bin/env bash
                echo "Shell Process ID: $$"
                # Replace Repository and tag
                cd ./argo-cd
                sed -r "s/^(\\s*repository\\s*:\\s*).*/\\1${REGISTRY}\\/nodejs-demo/" -i values-dev.yaml
                sed -r "s/^(\\s*tag\\s*:\\s*).*/\\1${BRANCH}-${GIT_COMMIT}/" -i values-dev.yaml
                git commit -am 'Publish new version' && git push origin main || echo 'no changes'
                '''
            }
        }

        stage('Deploy PROD') {
            when {
                branch 'prod'
            }
            steps {
                sh '''#!/usr/bin/env bash
                echo "Shell Process ID: $$"
                # Replace Repository and tag
                cd ./argo-cd
                sed -r "s/^(\\s*repository\\s*:\\s*).*/\\1${REGISTRY}\\/nodejs-demo/" -i values-prod.yaml
                sed -r "s/^(\\s*tag\\s*:\\s*).*/\\1${BRANCH}-${GIT_COMMIT}/" -i values-prod.yaml
                git commit -am 'Publish new version' && git push origin main || echo 'no changes'
                '''
            }
        }
    }
}
