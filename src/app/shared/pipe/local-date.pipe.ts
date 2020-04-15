import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

@Pipe({ name: 'localDate', pure: false })

export class DateLocalePipe implements PipeTransform {

  constructor(public translate: TranslateService) { }

transform(value: string, format: string): any {
    if (!this.translate.currentLang) {
      // const lang = this.translate.defaultLang;
    }

    const lang = this.translate.currentLang;
        if (!value) {
          return '';
        }

    moment.locale(lang);
        const tmpLocal = moment.utc(value).local();
        return tmpLocal.format(format);
      }
}
