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
      const explain = [];

      parts.forEach(criteria => {
        const first = criteria.trim().charAt(0);
        explain.push('<li>' + criteria + ' &ndash; ' + this.translateService.instant('criteria.' + first) + '</li>');
      });
      return '<ul class="' + args + '">' + explain.join('') + '</ul>';
    }
    return value;
  }

}
