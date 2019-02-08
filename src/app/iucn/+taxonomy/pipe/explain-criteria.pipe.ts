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

  transform(value: any, args?: any): any {
    if (typeof value === 'string') {
      const parts = value.split(';');
      const explain = [];

      parts.forEach(criteria => {
        const first = criteria.trim().charAt(0);
        explain.push(this.translateService.instant('criteria.' + first));
      });
      return value + '<br>' + explain.join('; ');
    }
    return value;
  }

}
