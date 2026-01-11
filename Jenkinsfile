// /////
pipeline {
    agent any

    stages {


        stage('Build Image') {
            steps {
                // Build Docker image from Dockerfile
                sh '''
                    docker build -t jenkins-react-pipeline:latest .
                '''
            }
        }

        stage('Deploy Container') {
            steps {
                sh '''
                    # Stop old container if exists (ignore error)
                    docker stop reactjs-cont || true

                    # Remove old container if exists (ignore error)
                    docker rm reactjs-cont || true

                    # Run new container (detached mode)
                    docker run -d \
                        --name reactjs-cont \
                        -p 3000:80 \
                        --restart unless-stopped \
                        jenkins-react-pipeline:latest
                '''
            }
        }

        stage('Add Domain Name') {
            steps {
                sh '''
                    # Check certbot installation
                    which certbot
                    certbot --version

                    # Auto add subdomain + nginx config
                    sudo /opt/ci/autoAddSubDomain.sh reactjs-test2 3000

                    # Reload nginx to apply changes
                    sudo systemctl reload nginx
                '''
            }
        }
    }
}

//////////


// pipeline {
//     agent any

//     stages {
//         stage("Build"){
//             steps{
//                 sh """
//                     docker build -t jenkins-react-pipeline . 
//                 """
//             }
//         }


//         stage("Deploy"){
//             steps{
//                 sh"""
//                 docker stop reactjs-cont || true 
//                 docker rm reactjs-cont || true 


//                 docker run -dp 3000:80 \
//                     --name reactjs-cont \
//                     jenkins-react-pipeline
//                 """

//             }
//         }
//         stage("Add Domain name "){
//             steps{
//                 sh """
//                 echo "Runing shellscript to add the domain name for the service " 
                
//                 """
//             }
//         }
//     }
// }