// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');
const { JUnitXmlReporter } = require('jasmine-reporters');

const [width, height] = [1200, 1000];

const chrome = {
  browserName: 'chrome',
  shardTestFiles: true,
  maxInstances: process.env.THREADS ? parseInt(process.env.THREADS) : 2,
  chromeOptions: {
    args: [
      `--window-size=${width},${height}`,
    ]
  }
};
if (process.env.HEADLESS !== 'false') {
  chrome.chromeOptions.args = [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    ...chrome.chromeOptions.args
  ];
}

exports.config = {
  SELENIUM_PROMISE_MANAGER: false,
  directConnect: false,
  multiCapabilities: [
    // { browserName: 'firefox' },
    chrome,
    // { browserName: 'MicrosoftEdge', platform: 'windows'}
  ],
  port: 3000,
  allScriptsTimeout: 20000,
  specs: [
    './src/**/*.e2e-spec.ts'
  ],
  suites: {
    saveObservations: './src/+save-observations/**/*.e2e-spec.ts',
    observations: './src/+observation/**/*.e2e-spec.ts',
    home: './src/+home/**/*.e2e-spec.ts',
    user: './src/+user/**/*.e2e-spec.ts',
    map: './src/+map/**/*.e2e-spec.ts',
    vihko: './src/+vihko/**/*.e2e-spec.ts',
    projectForm: './src/+project-form/**/*.e2e-spec.ts',
    geneticResource: './src/+theme/genetic-resource/*.e2e-spec.ts'
  },
  baseUrl: 'http://localhost:3000/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  },
  onPrepare() {
    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.e2e.json')
    });
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));

    const junitReporter = new JUnitXmlReporter({
      savePath: 'test-results/E2E',
      consolidateAll: false
    });
    jasmine.getEnv().addReporter(junitReporter);
    browser.driver.manage().window().setSize(width, height);
  },
  plugins: [{
    package: 'protractor-console-plugin',
    exclude: [
      /node_modules_laji-form/, // laji-form internal bug
      /reading '_leaflet_pos'/, // Leaflet internal bug
      /Failed to load resource: the server responded with a status of /, // Behaviour of failing resources might be intentionally tested.
      /fbcdn/, // Facebook widget
      /Error while waiting for Protractor/ // Test framework bugs are not bugs in the app
    ],
    logWarnings: false
  }],
};
