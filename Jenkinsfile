node {
  nvm('v16.20.0') {
    stage('Prepare environment') {
      cleanWs()
      git branch: 'development', url: 'https://github.com/luomus/laji.git'
      sh 'echo =============='
      sh 'ls /home/node/enable_scl_libs_for_laji_builds.sh'
      sh 'source /home/node/enable_scl_libs_for_laji_builds.sh && python3 --version'
      sh 'python3 --version'
      sh 'echo =============='
      sh 'source /home/node/enable_scl_libs_for_laji_builds.sh && npm ci'
      sh 'mkdir test-results'
      sh 'rm -rf test-results/*'
      currentBuild.result = 'SUCCESS'
    }
    stage('Build') {
      if (currentBuild.result == 'SUCCESS' || currentBuild.result == 'UNSTABLE') {
        milestone()
        sh 'rm -rf dist'
        sh 'source /home/node/enable_scl_libs_for_laji_builds.sh && npm run --silent build:dev # CI has too old python3 & g++ for node 16, so we load packages from Redhat SCL'
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
