import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LajiExternalService } from '../../../shared/service/laji-external.service';
import { FormField } from '../model/form-field';
import { ISO6709ToGeoJSON } from 'laji-map/lib/utils';

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

  private colMapping: Object;

  private userColMappings = {};
  private userValueMappings = {};

  private speciels = {
    'gatherings[*].geometry': 'geometry',
    'gatherings[*].units[*].unitGathering.geometry': 'geometry'
  };

  constructor(
    private translationService: TranslateService,
    private lajiExternalService: LajiExternalService,
  ) {
    this.lajiExternalService.getMap({})
  }

  addUserColMapping(mapping) {
    if (typeof mapping !== 'object' || Array.isArray(mapping)) {
      return;
    }
    Object.keys(mapping).map(col => {
      this.userColMappings[col.toUpperCase()] = mapping[col];
    });
  }

  addUserValueMapping(mapping) {
    if (typeof mapping !== 'object' || Array.isArray(mapping)) {
      return;
    }
    Object.keys(mapping).map(field => {
      if (typeof mapping[field] !== 'object' || Array.isArray(mapping[field])) {
        return;
      }
      if (!this.userValueMappings[field]) {
        this.userValueMappings[field] = {};
      }
      Object.keys(mapping[field])
        .map(key => {
          this.userValueMappings[field][key.toUpperCase()] = mapping[field][key];
        });
    });
  }

  initColMap(fields: {[key: string]: FormField}) {
    const lookup = {};
    Object.keys(fields).map((key) => {
      lookup[key.toUpperCase()] = key;
      lookup[fields[key].fullLabel.toUpperCase()] = key;
    });
    this.colMapping = lookup;
  }

  colMap(value: string) {
    if (!this.colMapping) {
      throw new ErrorEvent('Column map is not initialized!')
    }
    value = ('' + value).toUpperCase();
    return this.colMapping[value] || this.userColMappings[value] || null;
  }

  getUserValueMappings() {
    return this.userValueMappings;
  }

  map(value: any, field: FormField) {
    if (this.speciels[field.key]) {
      switch (this.speciels[field.key]) {
        case 'geometry':
          return this.analyzeGeometry(value);
      }
    }
    switch (field.type) {
      case 'string':
        if (field.key.endsWith('[*]')) {
          value = this.valueToArray(value, field);
        }
        if (!field.enum || value === null) {
          return value;
        }
        this.initStringMap(field);
        if (Array.isArray(value)) {
          return value.map(val => this.getMappedValue(val, field));
        }
        return this.getMappedValue(value, field);
      case 'number':
        const num = Number(value);
        if (isNaN(num)) {
          return null;
        }
        return num;
      case 'boolean':
        return this.mapToBoolean(value);
    }
    return null;
  }

  valueToArray(value: any, field: FormField) {
    if (typeof value === 'string') {
      return value.split(';').map(val => val.trim());
    } else if (typeof value === 'undefined') {
      return [];
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
      if (value === '') {
        return;
      }
      const label = field.enumNames[idx].toUpperCase();
      this.mapping.string[field.key][value.toUpperCase()] = value;
      this.mapping.string[field.key][label.toUpperCase()] = value;
    });
  }

  mapToBoolean(value): boolean|null {
    if (!this.mapping.boolean) {
      this.initBooleanMapping();
    }
    const bKey = ('' + value).trim().toUpperCase();
    return typeof this.mapping.boolean[bKey] !== 'undefined' ? this.mapping.boolean[bKey] : null;
  }

  mapFromBoolean(value: boolean): string {
    if (typeof value !== 'boolean') {
      return value;
    }
    const lang = this.translationService.currentLang;
    const key = value ? 'true' : 'false';
    return this.booleanMap[key][lang];
  }

  private analyzeGeometry(value: any) {
    if (typeof value === 'string') {
      const data = ISO6709ToGeoJSON(value);
      if (data && data.features && data.features[0] && data.features[0].geometry) {
        value = data.features[0].geometry;
      }
    }
    return value;
  }

  private getMappedValue(value: any, field: FormField) {
    switch (field.type) {
      case 'string':
        const str = ('' + value).toUpperCase();
        if (this.mapping.string[field.key] && this.mapping.string[field.key][str]) {
          return this.mapping.string[field.key][str];
        } else if (this.userValueMappings[field.key] && this.userValueMappings[field.key][str]) {
          return this.userValueMappings[field.key][str];
        }
    }
    return null;
  }

  private initBooleanMapping() {
    if (!this.mapping.boolean) {
      this.mapping.boolean = {};
    }
    for (const key in this.booleanMap.true) {
      if (this.booleanMap.true.hasOwnProperty(key)) {
        this.mapping.boolean[this.booleanMap.true[key].toUpperCase()] = true;
      }
    }
    for (const key in this.booleanMap.false) {
      if (this.booleanMap.true.hasOwnProperty(key)) {
        this.mapping.boolean[this.booleanMap.false[key].toUpperCase()] = false;
      }
    }
  }

}
