import { browser, $ } from 'protractor';
import { getAddressWithLang } from "../../helper";
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

}
