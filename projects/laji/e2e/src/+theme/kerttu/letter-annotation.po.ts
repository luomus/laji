import {browser, element, by, protractor, ElementFinder} from 'protractor';

export class KerttuLetterAnnotationPage {
  private letterTemplateSpectrogram = element(by.id('letterTemplateContainer')).all(by.className('spectrogram-canvas')).first();
  private letterCandidateSpectrogram = element(by.id('letterCandidateContainer')).all(by.className('spectrogram-canvas')).first();

  async navigateTo() {
    await browser.waitForAngularEnabled(false);
    return browser.get('/theme/kerttu/letters') as Promise<void>;
  }

  async letterTemplateIsVisible() {
    try {
      const EC = protractor.ExpectedConditions;
      await browser.wait(EC.presenceOf(this.letterTemplateSpectrogram), 5000);
      await browser.wait(() => this.canvasIsNotBlank(this.letterTemplateSpectrogram), 5000);
      return true;
    } catch (e) {
      return false;
    }
  }

  async letterCandidateIsVisible() {
    try {
      const EC = protractor.ExpectedConditions;
      await browser.wait(EC.presenceOf(this.letterCandidateSpectrogram), 5000);
      await browser.wait(() => this.canvasIsNotBlank(this.letterCandidateSpectrogram), 5000);
      return true;
    } catch (e) {
      return false;
    }
  }

  private canvasIsNotBlank(canvasElement: ElementFinder) {
    return browser.executeScript((e) => {
      const context = e.getContext('2d');

      const pixelBuffer = new Uint32Array(
        context.getImageData(0, 0, e.width, e.height).data.buffer
      );

      return pixelBuffer.some(color => color !== 0);
    }, canvasElement.getWebElement());
  }
}
