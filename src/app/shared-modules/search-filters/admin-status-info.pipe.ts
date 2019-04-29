import { Pipe, PipeTransform } from '@angular/core';
import { MultiLangService } from '../lang/service/multi-lang.service';
import { TranslateService } from '@ngx-translate/core';


@Pipe({
  name: 'adminStatusInfo'
})
export class AdminStatusInfoPipe implements PipeTransform {

  constructor(private translate: TranslateService) {}

  transform(value: any): any {
    if (!value) {
      return '';
    }
    let info = '';
    const description = MultiLangService.getValue(value.administrativeStatusDescription, this.translate.currentLang);
    const link = MultiLangService.getValue(value.administrativeStatusLink, this.translate.currentLang);
    if (description) {
      info += '<p>' + description + '</p>';
    }
    if (link) {
      info += '<p>' + this.translate.instant('readMore') + ': <a href="' + link + '" target="_blank">' + link + '</a>';
    }
    return info;
  }

}
