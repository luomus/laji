import { browser, ElementFinder, protractor } from 'protractor';

export const scrollIntoView = async ($elem: ElementFinder) => {
  browser.executeScript('arguments[0].scrollIntoView();', $elem);
  const top = await browser.executeScript('return arguments[0].getBoundingClientRect().top', $elem) as any;
  if (top < 50) {
    await scrollPageVertically(top - 50);
  }
}

export const scrollPageVertically = (y: number) => browser.executeScript(`scrollBy(0, ${y})`);

export const isDisplayed = async (elem: ElementFinder) => (await elem.isPresent()) && (await elem.isDisplayed());

export const EC = protractor.ExpectedConditions;

export const waitForVisibility = (elem: ElementFinder) => browser.wait(EC.visibilityOf(elem));
export const waitForInvisibility = (elem: ElementFinder) => browser.wait(EC.invisibilityOf(elem));
