import { $ } from 'protractor';

export class NavPage {

  private vihkoLink = $('a[href$="/vihko"]');
  private saveObservationLink = $('a[href$="/save-observations"]');
  private $lang = $('.language-toggle span');

  moveToSaveObservation() {
    return this.saveObservationLink.click();
  }

  moveToVihko() {
    return this.vihkoLink.click();
  }

  async getLang(): Promise<('fi' | 'sv' | 'en')> {
    const text = (await this.$lang.getText()).trim().toLowerCase();
    if (!['fi', 'sv', 'en'].includes(text)) {
      throw new Error('Couldn\'t get lang');
    }
    return text as ('fi' | 'sv' | 'en');
  }
}
