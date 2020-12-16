import { browser, ElementFinder } from 'protractor';

export const scrollIntoView = async ($elem: ElementFinder) => {
  browser.executeScript('arguments[0].scrollIntoView();', $elem);
  const top = await browser.executeScript('return arguments[0].getBoundingClientRect().top', $elem) as any;
  if (top < 50) {
    await scrollPageVertically(top - 50);
  }
}

export const scrollPageVertically = (y: number) => browser.executeScript(`scrollBy(0, ${y})`);
