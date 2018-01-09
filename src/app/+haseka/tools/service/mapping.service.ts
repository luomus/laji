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

  private mapping = {
    'boolean': null,
    'string': {}
  };

  constructor(private translationService: TranslateService) { }

  map(value: any, field?: FormField) {
    switch (field.type) {
      case 'string':
        if (!field.enum) {
          return value;
        }
        this.initStringMap(field);
        return this.mapping.string[field.key] || null;
      case 'number':
        const num = Number(value);
        if (isNaN(num)) {
          return null;
        }
        return num;
      case 'boolean':
        return this.mapFromBoolean(value);
    }
    return null;
  }

  reverseMap(value: any, field: FormField): any {
    switch (field.type) {
      case 'boolean':
        return this.mapFromBoolean(value);
    }
    return value;
  }

  initStringMap(field: FormField) {
    if (!field.enum) {
      return;
    }
    if (!this.mapping.string[field.key]) {
      this.mapping.string[field.key] = {};
    }
    field.enum.map((value, idx) => {
      const label = field.enumNames[idx].toLocaleUpperCase();
      this.mapping.string[value.toLocaleUpperCase()] = value;
      this.mapping.string[label] = value;
    });
  }

  mapToBoolean(value): boolean|null {
    if (!this.mapping.boolean) {
      this.initBooleanMapping();
    }
    return this.mapping.boolean[value] || null;
  }

  mapFromBoolean(value: boolean): string {
    if (typeof value !== 'boolean') {
      return value;
    }
    const lang = this.translationService.currentLang;
    const key = value ? 'true' : 'false';
    return this.booleanMap[key][lang];
  }

  private initBooleanMapping() {
    if (!this.mapping.boolean) {
      this.mapping.boolean = {};
    }
    for (const key in this.booleanMap.true) {
      if (this.booleanMap.true.hasOwnProperty(key)) {
        this.mapping.boolean[this.booleanMap.true[key]] = true;
      }
    }
    for (const key in this.booleanMap.false) {
      if (this.booleanMap.true.hasOwnProperty(key)) {
        this.mapping.boolean[this.booleanMap.true[key]] = false;
      }
    }
  }

}
