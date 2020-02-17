import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class CheckLangService {

  static readonly lang = ['en', 'fi', 'sv'];
  public current_lang: any;
  public value: any;
  public count: number;
  public checktranslation: any[];
  public ylesta_index: number;
  public info_index: number;

  constructor(private translate: TranslateService) {}

 public checkValue(info: any): any {
  this.checktranslation = [];
    info.forEach((item, index) => {
      this.checktranslation.push({'id': item.id, 'groups': []});
      (item.groups || []).forEach(group => {
        this.translationExist(group, group.group, index);
      });
    });

    this.checkYlestagroup(this.checktranslation);

    return this.checktranslation;
  }

  translationExist(item: any, id: string, index: number): boolean {
    this.current_lang = this.translate.currentLang;
    this.count = 0;
    const tmp_array = [];

    item.variables.forEach(text => {
      if (!text.content[this.current_lang]) {
        this.count++;
        tmp_array.push(true);
      } else {
        tmp_array.push(false);
      }
    });

    this.checktranslation[index].groups.push({'id': id, 'values': tmp_array, 'checkYlesta': false});

    if (this.count > 0) {
      return true;
    } else {
      return false;
    }
  }

  checkYlestagroup(data: any): any {

    data.forEach((item, i) => {
      this.ylesta_index = undefined;
      this.info_index = undefined;
      item.groups.forEach((element, index) => {
        if (element.id === 'MX.SDVG8') {
          this.ylesta_index = index;
        }
        if (element.id === 'MX.SDVG1') {
          this.info_index = index;
        }
      });

      if (this.ylesta_index >= 0 && this.info_index >= 0) {
        if (data[i].groups[this.ylesta_index].values.includes(false) && data[i].groups[this.info_index].values.includes(true)) {
          data[i].groups[this.info_index].checkYlesta = true;
        }
      }
    });

  }


}
