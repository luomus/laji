import { browser, by, element, promise as wdpromise } from 'protractor';
import config from '../../config';

export class UserPage {

  private usernameElem = element(by.id('logged-in-user'));

  navigateTo(): wdpromise.Promise<void> {
    return browser.get('/user');
  }

  getLoggedInUser(): wdpromise.Promise<string> {
    return this.usernameElem.getText();
  }

  isPresentUsername(): wdpromise.Promise<boolean> {
    return this.usernameElem.isPresent();
  }

  login(userToken?: string): wdpromise.Promise<void> {
    // Needed to make sure that the browser has been initialized
    browser.get('/');
    return browser.executeScript('localStorage.setItem("laji-token", "\\"' + (userToken || config.person.token) + '\\"");');
  }

  logout(): wdpromise.Promise<void> {
    return browser.executeScript('localStorage.setItem("laji-token", "\\"\\"");');
  }
}
