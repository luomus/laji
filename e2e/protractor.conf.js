// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');
const { JUnitXmlReporter } = require('jasmine-reporters');

let base =  {
  directConnect: true,
  capabilities: {
    chromeOptions: {
      args: [ "--headless", "--disable-gpu", "--window-size=1200x800" ]
    },
    browserName: 'chrome'
  }
};

switch (process.platform) {
  case "darwin":
    base = {
      directConnect: false,
      multiCapabilities: [
        { browserName: 'firefox' },
        { browserName: 'chrome' },
//        { browserName: 'safari' }
      ]
    };
    break;
  case "win32":
    base = {
      directConnect: false,
      multiCapabilities: [
        { browserName: 'firefox' },
        { browserName: 'chrome' },
        { browserName: 'internet explorer' }
      ]
    };
    break;
}

exports.config = {
  ...base,
  port: 3000,
  allScriptsTimeout: 20000,
  specs: [
    './src/**/*.e2e-spec.ts'
  ],
  suites: {
    vihko: './src/+haseka/**/*.e2e-spec.ts',
    home: './src/+home/**/*.e2e-spec.ts',
    user: './src/+user/**/*.e2e-spec.ts',
    map: './src/+map/**/*.e2e-spec.ts',
  },
  baseUrl: 'http://localhost:3000/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function() {}
  },
  onPrepare() {
    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.e2e.json')
    });
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));

    const junitReporter = new JUnitXmlReporter({
      savePath: '../test-results/E2E',
      consolidateAll: false
    });
    jasmine.getEnv().addReporter(junitReporter);
  }
};
