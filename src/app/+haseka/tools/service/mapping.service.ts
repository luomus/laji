import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormField } from '../model/form-field';

@Injectable()
export class MappingService {

  private readonly booleanMap = {
    'true': {
      'fi': 'Kyllä',
      'en': 'Yes',
      'sv': 'Ja'
    },
    'false': {
      'fi': 'Ei',
      'en': 'No',
      'sv': 'Nej'
    }
  };

  constructor(private translationService: TranslateService) { }

  map(value: any, field?: FormField) {

  }

  reverseMap(value: any, field: FormField): any {
    switch (field.type) {
      case 'boolean':
        return this.mapBoolean(value);
    }
    return value;
  }

  mapBoolean(value: boolean): string {
    if (typeof value !== 'boolean') {
      return value;
    }
    const lang = this.translationService.currentLang;
    const key = value ? 'true' : 'false';
    return this.booleanMap[key][lang];
  }

}
