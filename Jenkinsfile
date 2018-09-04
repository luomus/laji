node {
   stage('Prepare environment') {
    git branch: 'development', url: 'https://bitbucket.org/luomus/laji.fi-front.git'
    sh 'npm install -g yarn'
    sh 'yarn install --silent --frozen-lockfile'
  }
  stage('Quality') {
    sh 'yarn run lint'
  }
  stage('Build') {
    milestone()
    sh 'yarn run --silent build:ssr:dev'
    sh 'pre-compress-web-assets dist/browser'
  }
  stage('Archive') {
    sh 'tar -cvzf dist.tar.gz --strip-components=1 dist'
    archive 'dist.tar.gz'
  }
  stage('Deploy staging') {
    milestone()
    sh 'scp -r dist node@192.168.10.28:/data/dev_laji_fi/'
    sh 'ssh node@192.168.10.28 "pm2 restart dev"'
  }
}
