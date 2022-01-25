node {
  nvm('v14.16.0') {
    stage('Prepare environment') {
      cleanWs()
      git branch: 'development', url: 'https://github.com/luomus/laji.git'
      sh 'npm ci'
      sh 'mkdir test-results'
      sh 'rm -rf test-results/*'
    }
    stage('Build') {
      if (currentBuild.result == 'SUCCESS' || currentBuild.result == 'UNSTABLE') {
        milestone()
        sh 'rm -rf dist'
        sh 'npm run --silent build:dev'
        sh 'pre-compress-web-assets dist/browser'
      }
    }
    stage('Archive') {
      if (currentBuild.result == 'SUCCESS' || currentBuild.result == 'UNSTABLE') {
        sh 'tar -cvzf dist.tar.gz --strip-components=1 dist'
        archive 'dist.tar.gz'
      }
    }
    stage('Deploy staging') {
      if (currentBuild.result == 'SUCCESS' || currentBuild.result == 'UNSTABLE') {
        milestone()
        sh 'scp -r dist node@192.168.10.26:/data/dev_laji_fi/'
        slackSend(color: 'good', message: "dev.laji.fi - #$BUILD_NUMBER Success")
      } else {
        slackSend(color: 'danger', message: "dev.laji.fi - #$BUILD_NUMBER Failed")
      }
    }
  }
}
