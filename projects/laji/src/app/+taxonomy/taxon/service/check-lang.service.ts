import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class CheckLangService {

  static readonly lang = ['en', 'fi', 'sv'];
  public currentLang: any;
  public value: any;
  public count: number;
  public checktranslation: any[];
  public ylestaIndex: number;
  public infoIndex: number;

  constructor(private translate: TranslateService) {}

 public checkValue(info: any): any {
  this.checktranslation = [];
    info.forEach((item, index) => {
      this.checktranslation.push({id: item.id, groups: [], totalVisible: undefined});
      (item.groups || []).forEach(group => {
        this.translationExist(group, group.group, index);
      });
    });

    this.checkGeneralGroup(this.checktranslation);

    return this.checktranslation;
  }

  translationExist(item: any, id: string, index: number): boolean {
    this.currentLang = this.translate.currentLang;
    const tmpArray = [];

    item.variables.forEach(text => {
      if (!text.content[this.currentLang]) {
        tmpArray.push(true);
      } else {
        tmpArray.push(false);
      }
    });

    this.checktranslation[index].groups.push({id, values: tmpArray, checkYlesta: false});

    if (tmpArray.filter(x => x === false).length > 0) {
      return this.checktranslation[index].totalVisible = true;
    } else {
      return this.checktranslation[index].totalVisible = false;
    }

  }

  checkGeneralGroup(data: any): any {

    data.forEach((item, i) => {
      this.ylestaIndex = undefined;
      this.infoIndex = undefined;
      item.groups.forEach((element, index) => {
        if (element.id === 'MX.SDVG8') {
          this.ylestaIndex = index;
        }
        if (element.id === 'MX.SDVG1') {
          this.infoIndex = index;
        }
      });

      if (this.ylestaIndex >= 0 && this.infoIndex >= 0) {
        if (data[i].groups[this.ylestaIndex].values.includes(false) && data[i].groups[this.infoIndex].values.includes(true)) {
          data[i].groups[this.infoIndex].checkYlesta = true;
        }
      }
    });

  }


}
