import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LajiExternalService } from '../../../shared/service/laji-external.service';
import { FormField, VALUE_IGNORE } from '../model/form-field';
import { convertAnyToWGS84GeoJSON } from 'laji-map/lib/utils';
import {CoordinateService} from '../../../shared/service/coordinate.service';

export enum SpecialTypes {
  geometry = 'geometry',
  person = 'person',
  taxonID = 'taxonID',
  unitTaxon = 'unitTaxon',
  informalTaxonGroupID = 'informalTaxonGroupID',
  namedPlaceID = 'namedPlaceID',
  dateOptionalTime = 'dateOptionalTime',
  dateTime = 'dateTime',
  date = 'date',
  time = 'time',
}

@Injectable()
export class MappingService {

  public static readonly mergeKey = '_merge_';
  public static readonly valueSplitter = ';';

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
    'editors[*]': SpecialTypes.person,
    'gatheringEvent.leg[*]': SpecialTypes.person,
    'gatherings[*].leg': SpecialTypes.person,
    'gatherings[*].geometry': SpecialTypes.geometry,
    'gatherings[*].namedPlaceID': SpecialTypes.namedPlaceID,
    'gatherings[*].units[*].unitGathering.geometry': SpecialTypes.geometry,
    'gatherings[*].taxonCensus[*].censusTaxonID': SpecialTypes.taxonID,
    'gatherings[*].units[*].hostID': SpecialTypes.taxonID,
    'gatherings[*].units[*].informalTaxonGroups[*]': SpecialTypes.informalTaxonGroupID,
    'gatherings[*].dateBegin': SpecialTypes.dateOptionalTime,
    'gatherings[*].dateEnd': SpecialTypes.dateOptionalTime,
    'gatherings[*].units[*].identifications[*].detDate': SpecialTypes.dateOptionalTime,
    'gatherings[*].units[*].identifications[*].taxon': SpecialTypes.unitTaxon
  };

  constructor(
    private translationService: TranslateService,
    private lajiExternalService: LajiExternalService,
    private coordinateService: CoordinateService
  ) {
    this.lajiExternalService.getMap({})
  }


  rawValueToArray(value, field: FormField) {
    if (typeof value === 'string') {
      value = value.trim();
    }
    if (field.isArray) {
      if (typeof value === 'string') {
        return value.split(MappingService.valueSplitter).map(val => val.trim());
      }
      return [value];
    }
    return value;
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

  clearUserMapping() {
    this.userColMappings = {};
    this.userValueMappings = {};
  }

  getUserMappings(): {col: any, value: any} {
    return {
      col: this.userColMappings,
      value: this.userValueMappings
    }
  }

  setUserMapping(mapping: {col: any, value: any}) {
    if (mapping && mapping.col && mapping.value) {
      this.userColMappings = mapping.col;
      this.userValueMappings = mapping.value;
    } else {
      throw new Error('Map has to have both col and value keys!');
    }
  }

  hasUserMapping() {
    return Object.keys(this.userColMappings).length > 0 || Object.keys(this.userValueMappings).length > 0
  }

  getSpecial(field: FormField): SpecialTypes|null {
    if (field.key && this.specials[field.key]) {
      return this.specials[field.key];
    }
    return null;
  }

  map(value: any, field: FormField, allowUnMapped = false) {
    if (value === '' || value === null) {
      return value;
    }
    return this._map(value, field, allowUnMapped);
  }

  mapByFieldType(value: any, field: FormField) {
    const upperValue = ('' + value).toUpperCase();
    let realValue = null;
    switch (field.type) {
      case 'string':
        if (!field.enum) {
          realValue = value;
        } else {
          this.initStringMap(field);
          realValue = Array.isArray(upperValue) ?
            upperValue.map(val => this.getMappedValue(('' + val).toUpperCase(), field)) :
            this.getMappedValue(upperValue, field);
        }
        break;
      case 'integer':
        const num = Number(upperValue);
        if (!isNaN(num)) {
          realValue = num;
        }
        break;
      case 'boolean':
        this.initBooleanMapping();
        realValue = this.getMappedValue(upperValue, field);
        break;
    }
    return realValue;
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

  mapUnitTaxon(value) {
    if (value === VALUE_IGNORE || (typeof value === 'object' && value[MappingService.mergeKey])) {
      return value;
    }
    return null;
  }

  mapTaxonId(value) {
    if (typeof value === 'string') {
      const match = value.match(/(MX\.[0-9]+)/);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }

  mapNamedPlaceID(value) {
    if (typeof value === 'string') {
      const match = value.match(/(MNP\.[0-9]+)/);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }

  mapPerson(value, allowUnMapped = false) {
    if (typeof value === 'string') {
      const match = value.match(/(MA\.[0-9]+)/);
      if (match && match[1]) {
        return match[1];
      }
    }
    if (allowUnMapped) {
      return value;
    }
    return null;
  }

  private _map(value: any, field: FormField, allowUnMapped = false, convertToArray = true) {
    if (Array.isArray(value)) {
      value = value.map(val => this._map(val, field, allowUnMapped, false));
      if (!field.isArray) {
        value = value.join(MappingService.valueSplitter);
      } else if (value.length === 0) {
        return null;
      }
      return value;
    }
    const upperValue = ('' + value).toUpperCase();
    let targetValue = this.getUserMappedValue(upperValue, field);

    switch (this.getSpecial(field)) {
      case SpecialTypes.geometry:
        if (targetValue === null) {
          targetValue = this.analyzeGeometry(value);
        }
        break;
      case SpecialTypes.person:
        targetValue = this.mapPerson(targetValue || value, allowUnMapped);
        break;
      case SpecialTypes.taxonID:
        targetValue = this.mapTaxonId(targetValue || value);
        break;
      case SpecialTypes.unitTaxon:
        targetValue = this.mapUnitTaxon(targetValue || value);
        break;
      case SpecialTypes.namedPlaceID:
        targetValue = this.mapNamedPlaceID(targetValue || value);
        break;
      default:
        if (targetValue === null) {
          targetValue = this.mapByFieldType(value, field);
        }
    }
    if (convertToArray && field.isArray && !Array.isArray(targetValue)) {
      targetValue = [targetValue];
    }
    return targetValue;
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
    switch (field.type) {
      case 'string':
        return this.getUserMappedValue(value, field) ||
          (this.mapping.string[field.key] && this.mapping.string[field.key][value] || null);
      case 'boolean':
        const userValue = this.getUserMappedValue(value, field);
        return userValue !== null ?
          userValue : (typeof this.mapping.boolean[value] !== 'undefined' ? this.mapping.boolean[value] : null);
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
