import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IColMap, IFormField, IUserMappings, IValueMap, TUserValueMap, VALUE_IGNORE } from '../model/excel';
import { convertAnyToWGS84GeoJSON, latLngGridToGeoJSON } from 'laji-map/lib/utils';
import { CoordinateService } from '../../../shared/service/coordinate.service';
import { InformalTaxonGroup } from '../../../shared/model/InformalTaxonGroup';
import { SpreadsheetFacade } from '../spreadsheet.facade';
import { Util } from '../../../shared/service/util.service';

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
  keywords = 'keywords'
}

@Injectable()
export class MappingService {

  public static readonly mergeKey = '_merge_';
  public static readonly valueSplitter = ';';
  public static readonly keywordSplitters = [';', ','];

  // from boolean to translation key
  private readonly booleanMap = {
    'true': 'yes',
    'false': 'no'
  };

  private mapping = {
    'boolean': null,
    'string': {}
  };

  private colMapping?: IColMap;

  private userColMappings: IColMap = {};
  private userValueMappings: IValueMap = {};

  private specials = {
    'editors[*]': SpecialTypes.person,
    'namedPlaceID': SpecialTypes.namedPlaceID,
    'keywords[*]': SpecialTypes.keywords,
    'gatheringEvent.leg[*]': SpecialTypes.person,
    'gatheringEvent.dateBegin': SpecialTypes.dateOptionalTime,
    'gatheringEvent.dateEnd': SpecialTypes.dateOptionalTime,
    'gatherings[*].leg': SpecialTypes.person,
    'gatherings[*].geometry': SpecialTypes.geometry,
    'gatherings[*].namedPlaceID': SpecialTypes.namedPlaceID,
    'gatherings[*].keywords[*]': SpecialTypes.keywords,
    'gatherings[*].units[*].unitGathering.geometry': SpecialTypes.geometry,
    'gatherings[*].taxonCensus[*].censusTaxonID': SpecialTypes.taxonID,
    'gatherings[*].units[*].keywords[*]': SpecialTypes.keywords,
    'gatherings[*].units[*].hostID': SpecialTypes.taxonID,
    'gatherings[*].units[*].informalTaxonGroup': SpecialTypes.informalTaxonGroupID,
    'gatherings[*].units[*].informalTaxonGroups[*]': SpecialTypes.informalTaxonGroupID,
    'gatherings[*].dateBegin': SpecialTypes.dateOptionalTime,
    'gatherings[*].dateEnd': SpecialTypes.dateOptionalTime,
    'gatherings[*].units[*].identifications[*].detDate': SpecialTypes.dateOptionalTime,
    'gatherings[*].units[*].identifications[*].taxon': SpecialTypes.unitTaxon,
    'gatherings[*].units[*].identifications[*].taxonID': SpecialTypes.taxonID
  };

  static informalTaxonGroupsToList(groups: InformalTaxonGroup[], result = [], parent = ''): string[] {
    groups.forEach(group => {
      const name = parent ? `${parent} — ${group.name}` : group.name;
      result.push(`${name} (${group.id})`);
      if (Array.isArray(group.hasSubGroup)) {
        MappingService.informalTaxonGroupsToList(group.hasSubGroup as InformalTaxonGroup[], result, name);
      }
    });
    return result;
  }

  constructor(
    private translationService: TranslateService,
    private coordinateService: CoordinateService,
    private spreadsheetFacade: SpreadsheetFacade
  ) { }


  rawValueToArray(value: unknown, field: IFormField) {
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
    if (typeof mapping !== 'object' || Array.isArray(mapping) || Object.keys(mapping).length === 0) {
      return;
    }
    this.spreadsheetFacade.hasUserMapping(true);
    Object.keys(mapping).map(col => {
      this.userColMappings[col.toLowerCase()] = mapping[col];
    });
  }

  addUserValueMapping(mapping) {
    if (typeof mapping !== 'object' || Array.isArray(mapping)) {
      return;
    }
    let hasMapping = false;
    Object.keys(mapping).map(field => {
      if (typeof mapping[field] !== 'object' || Array.isArray(mapping[field])) {
        return;
      }
      if (!this.userValueMappings[field]) {
        this.userValueMappings[field] = {};
      }
      Object.keys(mapping[field])
        .map(key => {
          hasMapping = true;
          this.userValueMappings[field][key.toLowerCase()] = mapping[field][key];
        });
    });
    if (hasMapping) {
      this.spreadsheetFacade.hasUserMapping(true);
    }
  }

  clearUserValueMapping() {
    this.userValueMappings = {};
  }

  clearUserColMapping() {
    this.userColMappings = {};
  }

  initColMap(fields: {[key: string]: IFormField}) {
    const lookup = {};
    const simpleCols: {[label: string]: {cnt: number, key: string}} = {};
    Object.keys(fields).forEach((key) => {
      const label = fields[key].label.toLowerCase();
      lookup[key.toLowerCase()] = key;
      lookup[fields[key].fullLabel.toLowerCase()] = key;
      if (!simpleCols[label]) {
        simpleCols[label] = {cnt: 1, key: key};
      } else {
        simpleCols[label].cnt++;
      }
    });
    Object.keys(simpleCols).forEach(label => {
      if (simpleCols[label].cnt === 1) {
        lookup[label] = simpleCols[label].key;
      }
    });
    this.colMapping = lookup;
  }

  colMap(value: string): string {
    if (!this.colMapping) {
      throw new ErrorEvent('Column map is not initialized!');
    }
    value = ('' + value).toLowerCase();
    return this.colMapping[value] || this.userColMappings[value] || null;
  }

  clearUserMapping(): void {
    this.userColMappings = {};
    this.userValueMappings = {};
    this.spreadsheetFacade.hasUserMapping(false);
  }

  getUserMappings(): IUserMappings {
    return {
      col: this.userColMappings,
      value: this.userValueMappings
    };
  }

  setUserMapping(mapping: IUserMappings): void {
    if (mapping && mapping.col && mapping.value) {
      this.userColMappings = mapping.col;
      this.userValueMappings = mapping.value;
    } else {
      throw new Error('Map has to have both col and value keys!');
    }
  }

  hasUserMapping(): boolean {
    return Object.keys(this.userColMappings).length > 0 || Object.keys(this.userValueMappings).length > 0;
  }

  getSpecial(field: IFormField): SpecialTypes|null {
    if (field.key && this.specials[field.key]) {
      return this.specials[field.key];
    }
    return null;
  }

  getLabel(value: any, field: IFormField) {
    if (Array.isArray(value)) {
      return value.map((val) => this.getLabel(val, field));
    }
    switch (field.type) {
      case 'string':
        if (field.enum && field.enumNames) {
          const idx = field.enum.indexOf(value);
          if (idx !== -1) {
            return field.enumNames[idx];
          }
        }
        break;
      case 'boolean':
        return this.mapFromBoolean(value);
    }
    return value;
  }

  map(value: any, field: IFormField, allowUnMapped = false) {
    if (value === '' || value === null) {
      return value;
    }
    return this._map(value, field, allowUnMapped);
  }

  mapByFieldType(value: any, field: IFormField) {
    const upperValue = ('' + value).toLowerCase();
    let realValue = null;
    switch (field.type) {
      case 'string':
        if (!field.enum) {
          realValue = ['number', 'boolean', 'bigint'].includes(typeof value) ? '' + value : value;
        } else {
          this.initStringMap(field);
          realValue = Array.isArray(upperValue) ?
            upperValue.map(val => this.getMappedValue(('' + val).toLowerCase(), field)) :
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

  reverseMap(value: any, field: IFormField): any {
    switch (field.type) {
      case 'boolean':
        return this.mapFromBoolean(value);
    }
    return value;
  }

  initStringMap(field: IFormField) {
    if (!field.enum || this.mapping.string[field.key]) {
      return;
    }
    this.mapping.string[field.key] = {};
    field.enum.map((value, idx) => {
      if (value === '') {
        return;
      }
      const label = field.enumNames[idx].toLowerCase();
      this.mapping.string[field.key][value.toLowerCase()] = value;
      this.mapping.string[field.key][label.toLowerCase()] = value;
    });
  }

  mapFromBoolean(value: boolean): string {
    if (typeof value !== 'boolean') {
      return value;
    }
    return this.translationService.instant(value ? this.booleanMap.true : this.booleanMap.false);
  }

  mapUnitTaxon(value) {
    if (value === VALUE_IGNORE || (typeof value === 'object' && value[MappingService.mergeKey])) {
      return value;
    }
    return null;
  }

  mapInformalTaxonGroupId(value: unknown): string|null {
    return this.pickValue(value, /(MVL\.[0-9]+)/);
  }

  mapTaxonId(value: unknown): string|null {
    return this.pickValue(value, /(MX\.[0-9]+)/);
  }

  mapNamedPlaceID(value: unknown): string|null {
    return this.pickValue(value, /(MNP\.[0-9]+)/);
  }

  mapPerson(value: unknown, allowUnMapped = false): string|null {
    const result = this.pickValue(value, /(MA\.[0-9]+)/);
    if (result) {
      return result;
    }
    if (allowUnMapped) {
      return String(value || '');
    }
    return null;
  }

  mapDateOptionalTime(value: unknown): string {
    if (typeof value === 'string' && value.match(/^[0-9-.]+[\s,T]*[0-9-.:+Z]*$/)) {
      const parts = value.split(/[\s,T]+/);
      const dateParts = parts[0].split(/[.\-]/);
      if (dateParts.length === 3) {
        if (dateParts[0].length === 4) {
          parts[0] = dateParts.map(v => Util.addLeadingZero(v)).join('-');
        } else if (dateParts[2].length === 4) {
          parts[0] = dateParts.reverse().map(v => Util.addLeadingZero(v)).join('-');
        }
      }
      return parts.join('T');
    } else if (value instanceof Date) {
      if (
        this.matchTime(value, 0, 0, 0) || // Excel from Mac
        this.matchTime(value, 23, 59, 11) // Linux & Windows
      ) {
        return this.getDate(value);
      }
      return value.toISOString();
    }

    return String(value || '');
  }

  mapKeywords(value) {
    return typeof value === 'string' ?
      value.split(new RegExp(MappingService.keywordSplitters.join('|'), 'g')).map(val => val.trim()) :
      value;
  }

  private _map(value: any, field: IFormField, allowUnMapped = false, convertToArray = true): TUserValueMap|TUserValueMap[]|null {
    const fieldType = this.getSpecial(field);

    if (Array.isArray(value)) {
      value = value.map(val => this._map(val, field, allowUnMapped, false));
      if (!field.isArray) {
        value = value.join(MappingService.valueSplitter);
      } else if (value.length === 0) {
        return null;
      } else if (fieldType === SpecialTypes.keywords) {
        value = value.reduce((a, b) => a.concat(b), []);
      }
      return value;
    }
    const upperValue = ('' + value).toLowerCase();
    let targetValue: TUserValueMap|TUserValueMap[] = this.getUserMappedValue(upperValue, field);

    switch (fieldType) {
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
      case SpecialTypes.informalTaxonGroupID:
        targetValue = this.mapInformalTaxonGroupId(targetValue || value);
        break;
      case SpecialTypes.unitTaxon:
        targetValue = this.mapUnitTaxon(targetValue || value);
        break;
      case SpecialTypes.namedPlaceID:
        targetValue = this.mapNamedPlaceID(targetValue || value);
        break;
      case SpecialTypes.dateOptionalTime:
        targetValue = this.mapDateOptionalTime(targetValue || value);
        break;
      case SpecialTypes.keywords:
        targetValue = this.mapKeywords(targetValue || value);
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

  private matchTime(test: Date, hour: number, minutes: number, seconds: number): boolean {
    return test.getHours() === hour && test.getMinutes() === minutes && test.getSeconds() === seconds;
  }

  private getDate(value: Date): string {
    const tmpDate = new Date(value);
    tmpDate.setMinutes(value.getMinutes() - (value.getTimezoneOffset() - 1));
    return tmpDate.toISOString().substr(0, 10);
  }

  private pickValue(value: unknown, pickRegEx: RegExp) {
    if (typeof value === 'string') {
      const match = value.match(pickRegEx);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }

  private analyzeGeometry(value: any) {
    if (typeof value === 'string') {
      if (value.match(/^[0-9]{3,7}:[0-9]{3,7}$/)) {
        const ykjParts = value.split(':');
        if (ykjParts[0].length === ykjParts[1].length) {
          try {
            const data = latLngGridToGeoJSON([ykjParts[0], ykjParts[1]]);
            if (data.geometry) {
              return data.geometry;
            }
          } catch (e) {}
        }
      } else if (value.match(/^-?[0-9]{1,2}(\.[0-9]+)?,-?1?[0-9]{1,2}(\.[0-9]+)?$/)) {
        const wgsParts = value.split(',');
        return {
          type: 'Point',
          coordinates: [+wgsParts[1], +wgsParts[0]]
        };
      }
      try {
        const data: any = convertAnyToWGS84GeoJSON(value);
        if (data && data.features && data.features[0] && data.features[0].geometry) {
          value = data.features[0].geometry;
        }
      } catch (e) {
        return null;
      }
    }
    return value;
  }

  private getMappedValue(value: any, field: IFormField) {
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

  private getUserMappedValue(upperCaseValue: any, field: IFormField) {
    return this.userValueMappings[field.key] && typeof this.userValueMappings[field.key][upperCaseValue] !== 'undefined' ?
      this.userValueMappings[field.key] && this.userValueMappings[field.key][upperCaseValue] : null;
  }

  private initBooleanMapping() {
    if (this.mapping.boolean) {
      return;
    }
    this.mapping.boolean = {};
    const trueLabel = this.translationService.instant(this.booleanMap.true).toLowerCase();
    const falseLabel = this.translationService.instant(this.booleanMap.false).toLowerCase();
    this.mapping.boolean[trueLabel] = true;
    this.mapping.boolean[falseLabel] = false;
  }

}
