pipeline {
    agent any

    environment {
        // Industry Standard: Define all variables upfront
        DOCKER_REGISTRY = "amaanahmed12"
        IMAGE_NAME = "police_final_frontend"
        // Use Jenkins build number for dynamic tagging (Prevents 'latest' tag conflicts)
        IMAGE_TAG = "v${BUILD_NUMBER}"
        FULL_IMAGE = "${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
    }

    stages {
        stage('Checkout') {
            steps {
                // Standard Jenkins scm checkout (pulls from whatever repo triggered the job)
                checkout scm
            }
        }

        stage('Docker Build') {
            steps {
                echo "Building Docker Image: ${FULL_IMAGE}"
                sh "docker build -t ${FULL_IMAGE} ."
                // Also tag as latest for convenience in manual testing
                sh "docker tag ${FULL_IMAGE} ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest"
            }
        }

        stage('Push to Registry') {
            steps {
                echo "Pushing Image to Registry..."
                // Industry Standard: Inject secrets safely using Jenkins Credentials Binding
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                    sh "echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin"
                }
                
                sh "docker push ${FULL_IMAGE}"
                sh "docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:latest"
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo "Deploying to Minikube cluster..."
                // Dynamically inject the new image tag into the deployment file before applying
                sh "sed -i 's|image: .*|image: ${FULL_IMAGE}|g' k8s/frontend/deployment.yaml"
                
                // Apply all manifests in the folder
                sh "kubectl apply -f k8s/frontend/"
            }
        }
    }
    
    post {
        always {
            // Industry Standard: Clean up CI/CD runner to prevent disk exhaustion
            echo "Cleaning up local Docker images to save space..."
            sh "docker rmi ${FULL_IMAGE} || true"
        }
    }
}
