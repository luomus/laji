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
  latestUnsaved = latestDocumentsView('.vihko-latest-unsaved');
}

const latestDocumentsView = (selector: string) => {
  const container$ = $(selector);
  const spinner$ = container$.$('laji-spinner');
  const shortDocs$$ = container$.$$('laji-short-document');
  return {
    container$,
    spinner$,
    shortDocs$$,
    waitUntilLoaded() {
      return waitForInvisibility(spinner$);
    },
    getShortDoc: (idx: number) => {
      return {
        getEditLink: () => shortDocs$$.get(idx).$('a').getAttribute('href')
      }
    }
  };
};
