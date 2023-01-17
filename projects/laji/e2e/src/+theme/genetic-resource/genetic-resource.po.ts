import { $, browser } from 'protractor';
import { waitForInvisibility } from '../../../helper';

export class GeneticResourcePage {
  private spinners$ = $('laji-observation-result').$$('.spinner');

  async navigateToMollusca() {
    await browser.get(`theme/luomusgrc/search/list?keyword=http:%2F%2Ftun.fi%2FGX.8057`);
  }
  async hasNonGQLApiErrors() {
    const browserLog = await browser.manage().logs().get('browser');
    const badRequests = browserLog.filter(entry =>
      // matches any string that includes api/ followed by 400/404/500, but does not include graphql
      entry.message.match(/.*api\/(?!graphql).*(?:40[04]|500)/)
    );
    return badRequests.length > 0;
  }
  async waitUntilLoaded() {
    for (const spinner$ of await this.spinners$) {
      await waitForInvisibility(spinner$);
    }
  }
}
