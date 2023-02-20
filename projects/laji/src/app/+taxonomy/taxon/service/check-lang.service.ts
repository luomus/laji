import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TaxonomyDescription } from '../../../shared/model/Taxonomy';

@Injectable()
export class CheckLangService {

  static readonly lang = ['en', 'fi', 'sv'];
  public currentLang: any;
  public translationChecklist: any[];

  constructor(private translate: TranslateService) { }

  // creates a list of groups, where each variable is given a value depending on whether it has content in the used language
  // true value means that the variable doesn't have content in the currently used language
  public createTranslationChecklist(taxonDescription: TaxonomyDescription[]): any {
    this.translationChecklist = [];
    taxonDescription.forEach((item, index) => {
      this.translationChecklist.push({ id: item.id, groups: [] });
      (item.groups || []).forEach(group => {
        this.checkVariableTranslations(group, group.group, index);
      });
    });

    return this.translationChecklist;
  }

  checkVariableTranslations(item: any, id: string, index: number): void {
    this.currentLang = this.translate.currentLang;
    const tmpArray = [];
    let hasTranslatedContent = false;

    item.variables.forEach(text => {
      if (!text.content[this.currentLang]) {
        tmpArray.push(true); // true, i.e. no content in the currently used language
      } else {
        tmpArray.push(false); // false, i.e. has content in the currently used language
        if (!hasTranslatedContent) { hasTranslatedContent = true; }
      }
    });

    this.translationChecklist[index].groups.push({ id, values: tmpArray, hasTranslatedContent });
  }
}
