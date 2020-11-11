import { browser, by, element, protractor } from 'protractor';

export const DEFAULT_TEST_USER = 'vixriihi+e2e-no@gmail.com';

export const TEST_USERS = {
  'vixriihi+e2e-no@gmail.com': {
    id: 'MA.1437',
    nameWithGroup: 'E2E Testing ((no access))',
    name: 'E2E Testing',
    pw: '3Lr4nzZvfZVPPic'
  }
};

export class UserPage {

  private usernameElem = element(by.id('logged-in-user'));
  private loginElem = element(by.id('login-link'));
  private logoutElem = element(by.css('[href$="/user/logout"]'));

  // laji-auth
  private authLocal = element(by.id('local-login'));
  private authUsername = element(by.css('[name="email"]'));
  private authPassword = element(by.css('[name="password"]'));
  private submitButton = element(by.css('button.submit'));

  async navigateTo() {
    return browser.get('/user') as Promise<void>;
  }

  getLoggedInUsersName() {
    return this.usernameElem.getText() as Promise<string>;
  }

  isPresentLoggedInUsersName() {
    return this.usernameElem.isPresent() as Promise<boolean>;
  }

  async login(user = DEFAULT_TEST_USER): Promise<void> {
    const currentUrl = await browser.getCurrentUrl();
    if (!currentUrl) {
      throw new Error('You must navigate to page before ensuring logged in!');
    }

    await browser.waitForAngularEnabled(false);
    if (!await this.usernameElem.isPresent()) {
      if (!await this.authLocal.isPresent()) {
        await this.loginElem.click();
      }
      await this.authLocal.click();
      await this.authUsername.sendKeys(user);
      await this.authPassword.sendKeys(TEST_USERS[user].pw);
      await this.submitButton.click();


      const EC = protractor.ExpectedConditions;
      const loginDone = EC.urlContains(browser.baseUrl);
      await browser.wait(loginDone, 2000);
      await browser.sleep(1000);
    }
    await browser.waitForAngularEnabled(true);
  }

  async logout(): Promise<void> {
    if (await this.usernameElem.isPresent()) {
      await this.usernameElem.click();
      await this.logoutElem.click();

      const EC = protractor.ExpectedConditions;
      const logoutDone = EC.urlIs(browser.baseUrl);
      await browser.wait(logoutDone, 2000);
    }
  }
}
