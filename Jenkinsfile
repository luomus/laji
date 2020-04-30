node {
  nvm('v10.17.0') {
    stage('Prepare environment') {
      cleanWs()
      git branch: 'development', url: 'https://bitbucket.org/luomus/laji.fi-front.git'
      sh 'npm ci'
    }
    stage('Quality') {
      sh 'npm run lint'
    }
    stage('Build') {
      milestone()
      sh 'rm -rf dist'
      sh 'npm run --silent build:dev'
      sh 'pre-compress-web-assets dist/browser'
    }
    stage('Archive') {
      sh 'tar -cvzf dist.tar.gz --strip-components=1 dist'
      archive 'dist.tar.gz'
    }
    stage('Deploy staging') {
      milestone()
      sh 'scp -r dist node@192.168.10.26:/data/dev_laji_fi/'
      slackSend(color: 'good', message: "dev.laji.fi - #$BUILD_NUMBER Success")
    }
  }
}
