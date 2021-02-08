node {
  nvm('v14.15.4') {
    stage('Prepare environment') {
      cleanWs()
      git branch: 'development', url: 'https://github.com/luomus/laji.git'
      sh 'npm ci'
      sh 'mkdir test-results'
      sh 'rm -rf test-results/*'
    }
    stage('Quality') {
      catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
        sh './node_modules/.bin/ng lint laji --format junit > ./test-results/output-tslint.xml'
      }
    }
    stage('Run integration tests') {
      sh './node_modules/.bin/webdriver-manager clean'
      sh './node_modules/.bin/webdriver-manager update --versions.chrome=$(google-chrome --version | awk \'{print $3}\')'
      catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
        sh 'npm run e2e:ci -- --webdriver-update=false'
      }
      junit allowEmptyResults: true, testResults: '**/test-results/**/*.xml'
    }
    stage('Build') {
      if (currentBuild.result == 'SUCCESS') {
        milestone()
        sh 'rm -rf dist'
        sh 'npm run --silent build:dev'
        sh 'pre-compress-web-assets dist/browser'
      }
    }
    stage('Archive') {
      if (currentBuild.result == 'SUCCESS') {
        sh 'tar -cvzf dist.tar.gz --strip-components=1 dist'
        archive 'dist.tar.gz'
      }
    }
    stage('Deploy staging') {
      if (currentBuild.result == 'SUCCESS') {
        milestone()
        sh 'scp -r dist node@192.168.10.26:/data/dev_laji_fi/'
        slackSend(color: 'good', message: "dev.laji.fi - #$BUILD_NUMBER Success")
      } else {
        slackSend(color: 'danger', message: "dev.laji.fi - #$BUILD_NUMBER Failed")
      }
    }
  }
}
