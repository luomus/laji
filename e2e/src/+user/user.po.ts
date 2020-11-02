import { browser, by, element } from 'protractor';

const testUsers = {
  'vixriihi+e2e-no@gmail.com': {
    id: 'MA.1437',
    name: 'E2E Testing ((no access))',
    pw: '3Lr4nzZvfZVPPic'
  }
};

let currentUser;

export class UserPage {

  private usernameElem = element.all(by.id('logged-in-user'));
  private loginElem = element(by.id('login-link'));

  // laji-auth
  private authLocal = element(by.id('local-login'));
  private authUsername = element(by.css('[name="email"]'));
  private authPassword = element(by.css('[name="password"]'));
  private submitButton = element(by.css('button.submit'));

  async navigateTo() {
    return browser.get('/user') as Promise<void>;
  }

  getLoggedInUser() {
    return this.usernameElem.getText() as Promise<string>;
  }

  isPresentUsername() {
    return this.usernameElem.isPresent() as Promise<boolean>;
  }

  getUsersName() {
    return testUsers[currentUser].name;
  }

  async login(user = 'vixriihi+e2e-no@gmail.com'): Promise<void> {
    await browser.waitForAngularEnabled(false);
    if (!await this.usernameElem.isPresent()) {
      currentUser = user;
      await this.loginElem.click();
      await this.authLocal.click();
      await this.authUsername.sendKeys(user);
      await this.authPassword.sendKeys(testUsers[user].pw);
      await this.submitButton.click();
    }
    browser.waitForAngularEnabled(true);
  }

  async logout(): Promise<void> {
    if (await this.usernameElem.isPresent()) {
      await this.loginElem.click();
    }
  }
}
