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

const EC = protractor.ExpectedConditions;

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

    try {
      const userNameExists = EC.presenceOf(this.usernameElem);
      await browser.wait(userNameExists, 500);
    } catch (e) {}

    if (!await this.usernameElem.isPresent()) {
      if (!await this.authLocal.isPresent()) {
        await this.loginElem.click();
      }
      await this.doExternalLogin(user);
    }
  }

  async doExternalLogin(user = DEFAULT_TEST_USER) {
    await browser.waitForAngularEnabled(false);

    await browser.wait(EC.visibilityOf(this.authLocal), 2000);
    await this.authLocal.click();
    await this.authUsername.sendKeys(user);
    await this.authPassword.sendKeys(TEST_USERS[user].pw);
    await this.submitButton.click();

    const loginDone = EC.urlContains(browser.baseUrl);
    await browser.wait(loginDone, 2000);
    await browser.sleep(1000);

    await browser.waitForAngularEnabled(true);
  }

  async logout(): Promise<void> {
    const currentUrl = await browser.getCurrentUrl();
    if (!currentUrl) {
      throw new Error('You must navigate to page before ensuring logged in!');
    }
    if (await this.usernameElem.isPresent()) {
      await this.usernameElem.click();
      await this.logoutElem.click();

      const logoutDone = EC.urlIs(browser.baseUrl);
      await browser.wait(logoutDone, 2000);
    }
  }

  async isOnExternalLoginPage() {
    await browser.waitForAngularEnabled(false);
    await browser.wait(EC.visibilityOf(this.authLocal), 5000);
    const isOnAuthPage = (await this.authLocal.isPresent()) && (await this.authLocal.isDisplayed());
    await browser.waitForAngularEnabled(true);
    return isOnAuthPage;
  }

  async handleNavigationWithExternalLogin(navigate: () => Promise<void>) {
    let isFirstNavigation = false;
    try {
      await browser.getCurrentUrl();
    } catch (e) {
      isFirstNavigation = true;
    }
    if (isFirstNavigation) {
      await browser.waitForAngularEnabled(false);
    }
    await navigate();
    if (isFirstNavigation) {
      await this.doExternalLogin();
    }
    await browser.waitForAngularEnabled(true);
  }
}
