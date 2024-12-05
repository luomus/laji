import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'explainCriteria'
})
export class ExplainCriteriaPipe implements PipeTransform {

  constructor(
    private translateService: TranslateService
  ) {

  }

  transform(value: any, args?: string): any {
    if (typeof value === 'string') {
      const parts = value.split(';');
      const explain: string[] = [];

      parts.forEach(criteria => {
        const trimmedCriteria = criteria.trim();
        const firstLetter = trimmedCriteria.charAt(0);
        const useSecond = ['B', 'C', 'D'].indexOf(firstLetter) !== -1;
        if (useSecond) {
          trimmedCriteria.split('+').forEach((sub, idx) => {
            const second = sub.charAt(idx === 0 ? 1 : 0);
            this.addTranslation((idx === 0 ? '' : firstLetter) + sub, firstLetter + second, explain);
          });
        } else {
          this.addTranslation(criteria, firstLetter, explain);
        }
      });
      return '<ul class="' + args + '">' + explain.join('') + '</ul>';
    }
    return value;
  }

  private addTranslation(criteria: string, key: string, content: string[]) {
    const translateKey = 'criteria.' + key;
    const translation = this.translateService.instant(translateKey);
    content.push(translateKey === translation ?
      '<li>' + criteria + '</li>' :
      '<li>' + criteria + ' &ndash; ' + translation + '</li>'
    );
  }

}
