node {
  nvm('v14.15.4') {
    stage('Prepare environment') {
      cleanWs()
      git branch: 'development', url: 'https://github.com/luomus/laji.git'
      sh 'npm ci'
    }
    stage('Quality') {
      sh 'npm run lint'
    }
    stage('Run tests') {
      sh 'node ./node_modules/protractor/bin/webdriver-manager update'
      sh 'npm run e2e'
      junit 'projects/laji/e2e/test-results/**/*.xml'
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
