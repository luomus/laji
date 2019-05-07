import { Injectable } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

@Injectable()
export class CheckLangService {

  static readonly lang = ['en', 'fi', 'sv'];
  public current_lang: any;
  public value: any;
  public count: number;
  public checktranslation: any;

  constructor(private translate: TranslateService) {}

 public checkValue(info: any): any {
  this.count = 0;
    info.forEach((testo) => {
        this.translationExist(testo.variables[0].content);
    });
    if (this.count > 0) {
      return true;
    } else {
      return false;
    }
  }

  translationExist(text: object): any {
    this.current_lang = this.translate.currentLang;
       if (!text[this.current_lang]) {
         this.count++;
       }
  }

}
