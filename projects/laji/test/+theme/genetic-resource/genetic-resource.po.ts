import { Page } from '@playwright/test';

export class GeneticResourcePage {
  public $spinners = this.page.locator('laji-observation-result').locator('.spinner');

  public hasNonGQLApiErrors = false;

  constructor(
    private page: Page
  ) {
    this.page.on('response', resp => {
      if (resp.url().match(/.*api\/(?!graphql).*/) && [400, 404, 500].includes(resp.status())) {
        this.hasNonGQLApiErrors = true;
      }
    });
  }

  navigateToMollusca() {
    return this.page.goto('theme/luomusgrc/search/list?keyword=http:%2F%2Ftun.fi%2FGX.8057');
  }

  async waitUntilLoaded() {
    const $spinners = await this.$spinners.all();
    await Promise.all($spinners.map($spinner => $spinner.waitFor({state: 'hidden'})));
  }
}
