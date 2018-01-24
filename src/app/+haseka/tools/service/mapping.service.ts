import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LajiExternalService } from '../../../shared/service/laji-external.service';
import { FormField } from '../model/form-field';
import { convertAnyToWGS84GeoJSON } from 'laji-map/lib/utils';
import {CoordinateService} from '../../../shared/service/coordinate.service';

export enum SpeciesTypes {
  geometry = 'geometry',
  person = 'person'
}

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

  private specials = {
    'editors[*]': SpeciesTypes.person,
    'gatheringEvent.leg[*]': SpeciesTypes.person,
    'gatherings[*].leg': SpeciesTypes.person,
    'gatherings[*].geometry': SpeciesTypes.geometry,
    'gatherings[*].units[*].unitGathering.geometry': SpeciesTypes.geometry
  };

  constructor(
    private translationService: TranslateService,
    private lajiExternalService: LajiExternalService,
    private coordinateService: CoordinateService
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

  getSpecial(field: FormField): SpeciesTypes|null {
    if (field.key && this.specials[field.key]) {
      return this.specials[field.key];
    }
    return null;
  }

  map(value: any, field: FormField) {
    switch (this.getSpecial(field)) {
      case SpeciesTypes.geometry:
        const mappedValue = this.getUserMappedValue(('' + value).toUpperCase(), field);
        if (mappedValue !== null) {
          return mappedValue;
        }
        return this.analyzeGeometry(value);
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
      case 'integer':
        const mappedValue = this.getUserMappedValue(('' + value).toUpperCase(), field);
        if (mappedValue !== null) {
          value = mappedValue;
        }
        const num = Number(value);
        if (isNaN(num)) {
          return null;
        }
        return num;
      case 'boolean':
        this.initBooleanMapping();
        return this.getMappedValue(value, field);
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
    if (!field.enum || this.mapping.string[field.key]) {
      return;
    }
    this.mapping.string[field.key] = {};
    field.enum.map((value, idx) => {
      if (value === '') {
        return;
      }
      const label = field.enumNames[idx].toUpperCase();
      this.mapping.string[field.key][value.toUpperCase()] = value;
      this.mapping.string[field.key][label.toUpperCase()] = value;
    });
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
      if (value.match(/^[0-9]{3,7}:[0-9]{3,7}$/)) {
        const parts = value.split(':');
        if (parts[0].length === parts[1].length) {
          return this.coordinateService.convertYkjToGeoJsonFeature(parts[0], parts[1]).geometry;
        }
      }
      try {
        const data = convertAnyToWGS84GeoJSON(value);
        if (data && data.features && data.features[0] && data.features[0].geometry) {
          value = data.features[0].geometry;
        }
      } catch (e) {
        return null;
      }
    }
    return value;
  }

  private getMappedValue(value: any, field: FormField) {
    const str = ('' + value).toUpperCase();
    switch (field.type) {
      case 'string':
        return this.getUserMappedValue(str, field) ||
          (this.mapping.string[field.key] && this.mapping.string[field.key][str] || null);
      case 'boolean':
        const userValue = this.getUserMappedValue(str, field);
        return userValue !== null ?
          userValue : (typeof this.mapping.boolean[str] !== 'undefined' ? this.mapping.boolean[str] : null);
    }
    return null;
  }

  private getUserMappedValue(upperCaseValue: any, field: FormField) {
    return this.userValueMappings[field.key] && typeof this.userValueMappings[field.key][upperCaseValue] !== 'undefined' ?
      this.userValueMappings[field.key] && this.userValueMappings[field.key][upperCaseValue] : null;
  }

  private initBooleanMapping() {
    if (this.mapping.boolean) {
      return;
    }
    this.mapping.boolean = {};
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
