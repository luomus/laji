import { Pipe, PipeTransform } from '@angular/core';
import { MultiLangService } from '../service/multi-lang.service';

@Pipe({
  name: 'multiLangAll',
  pure: true
})
export class MultiLangAllPipe implements PipeTransform {
  public value = '';

  constructor() { }

  transform(value: any): string {
    if (typeof value === 'string' || typeof value !== 'object') {
      return value;
    }
    this.value = this.langToString(value);
    return this.value;
  }

  private langToString(value) {
    const values = [];
    for (let i = 0; i < MultiLangService.lang.length; i++) {
      const lang = MultiLangService.lang[i];

      if (MultiLangService.hasValue(value, lang)) {
        const val = MultiLangService.getValue(value, lang);
        if (Array.isArray(val)) {
          for (let j = 0; j < val.length; j++) {
            values.push(val[j] + ' (' + lang + ')');
          }
        } else {
          values.push(val + ' (' + lang + ')');
        }
      }
    }

    return values.join('; ');
  }
}
