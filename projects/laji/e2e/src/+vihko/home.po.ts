import { browser, $ } from 'protractor';
import { getAddressWithLang, waitForInvisibility } from "../../helper";
import { NavPage } from "../shared/nav.po";

export class VihkoHomePage {

  public readonly $content = $('.haseka-home');

  async navigateTo(lang?: 'fi' | 'en' | 'sv') {
    return browser.get(getAddressWithLang('/vihko/home', lang)) as Promise<void>;
  }

  async clickFormById(id: string) {
    const lang = await new NavPage().getLang();
    return $(`[href="${getAddressWithLang(`/project/${id}`, lang)}"`).click() as Promise<void>;
  }

  latestSaved = latestDocumentsView('.vihko-latest-saved');
  latestUnsaved = latestDocumentsView('.vihko-latest-unsaved', !!'reverse');
}

const latestDocumentsView = (selector: string, orderReverse = false) => {
  const container$ = $(selector);
  const spinner$ = container$.$('laji-spinner');
  const shortDocs$$ = container$.$$('laji-short-document');
  const getShortDoc = (idx: number) => {
    return {
      getEditLink: () => shortDocs$$.get(idx).$('a').getAttribute('href')
    };
  };
  return {
    container$,
    spinner$,
    shortDocs$$,
    waitUntilLoaded() {
      return waitForInvisibility(spinner$);
    },
    getShortDoc,
    getLatestShortDoc: async () => getShortDoc(orderReverse ? 0 : await shortDocs$$.count() - 1)
  };
};
