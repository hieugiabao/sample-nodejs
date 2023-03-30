pipeline {
    agent any
    environment {
        REGISTRY_NAME               = credentials('REGISTRY_NAME')
        DOCKER_REGISTRY_USERNAME    = credentials('DOCKER_REGISTRY_USERNAME')
        DOCKER_REGISTRY_PASSWORD    = credentials('DOCKER_REGISTRY_PASSWORD')
    }

    stages {
        stage('git-checkout') {
            steps {
                checkout([$class: 'GitSCM',
                    branches: [[name: '*/master']],
                    extensions: scm.extensions,
                    userRemoteConfigs: [[
                        url: 'https://github.com/hieugiabao/sample-nodejs.git',
                        credentialsId: 'github-credentials'
                    ]]
                ])
            }
        }
        stage('docker-build/push-registry') {
            steps {
                sh '''#!/usr/bin/env bash
                cd app_code
                docker login -u ${DOCKER_REGISTRY_USERNAME} -p ${DOCKER_REGISTRY_PASSWORD}
                docker build --tag "${REGISTRY_NAME}/nodejs-demo:${BUILD_NUMBER}" .
                docker push "${REGISTRY_NAME}/nodejs-demo:${BUILD_NUMBER}"
                '''
            }
        }
    }
}
