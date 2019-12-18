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
    if (value.description) {
      info += '<p>' + value.description + '</p>';
    }
    if (value.link) {
      info += '<p>' + this.translate.instant('readMore') + ': <a href="' + value.link + '" target="_blank">' + value.link + '</a>';
    }
    return info;
  }

}
