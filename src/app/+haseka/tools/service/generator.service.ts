import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { IFormField, splitType } from '../model/excel';
import { UserService } from '../../../shared/service/user.service';
import { MappingService, SpecialTypes } from './mapping.service';
import { Person } from '../../../shared/model/Person';
import { InformalTaxonGroup } from '../../../shared/model/InformalTaxonGroup';
import { forkJoin as ObservableForkJoin } from 'rxjs';
import { NamedPlacesService } from '../../../shared-modules/named-place/named-places.service';
import { TranslateService } from '@ngx-translate/core';
import { InformalTaxonGroupApi } from '../../../shared/api/InformalTaxonGroupApi';
import { ExportService } from '../../../shared/service/export.service';
import { map, take } from 'rxjs/operators';
import { ExcelToolService } from './excel-tool.service';

@Injectable()
export class GeneratorService {

  public static splitDate = {
    mm: '@mm',
    dd: '@dd',
    yyyy: '@yyyy'
  };

  public static splitCoordinate = {
    N: '@N',
    E: '@E',
    system: '@sys'
  };

  public static splitCoordinateSystems = ['ykj', 'wgs84'];

  public static splittableFields: {[key: string]: splitType} = {
    'gatheringEvent.dateBegin': 'date',
    'gatheringEvent.dateEnd': 'date',
    'gatherings[*].geometry': 'coordinate',
  };

  private sheetNames = {
    'base': 'Tallennuspohja',
    'vars': 'Muuttujat', // This name cannot have spaces in it
    'info': 'Ohjeet'
  };

  private instructionArray = 'excel.info.array';

  private instructionMapping: {[place: string]: string} = {
    'editors[*]': 'excel.info.personID',
    'gatheringEvent.leg[*]': 'excel.info.personID',
    'gatheringEvent.dateBegin': 'excel.info.date',
    'gatheringEvent.dateEnd': 'excel.info.date',
    'gatherings[*].units[*].unitGathering.dateBegin': 'excel.info.date',
    'gatherings[*].units[*].unitGathering.dateEnd': 'excel.info.date',
    'gatherings[*].units[*].identifications[*].detDate': 'excel.info.date',
    'gatherings[*].units[*].hostID': 'excel.info.taxonID',
    'gatherings[*].taxonCensus[*].censusTaxonID': 'excel.info.taxonID',
    'gatherings[*].units[*].unitGathering.geometry': 'excel.info.geometry',
    'gatherings[*].geometry': 'excel.info.geometry',
    'gatherings[*].namedPlaceID': 'excel.info.namedPlaceID',
  };

  constructor(
    private mappingService: MappingService,
    private userService: UserService,
    private namedPlaces: NamedPlacesService,
    private translateService: TranslateService,
    private informalTaxonApi: InformalTaxonGroupApi,
    private exportService: ExportService,
    private excelToolService: ExcelToolService
  ) { }

  generate(
    formID: string,
    filename: string,
    fields: IFormField[],
    useLabels = true,
    type: 'ods' | 'xlsx' = 'xlsx',
    next: () => void = () => {}
  ) {
    const allTranslations = Object.keys(this.instructionMapping).map(key => this.instructionMapping[key]);
    allTranslations.push(this.instructionArray);
    ObservableForkJoin(
      this.userService.user$.pipe(take(1)),
      this.excelToolService.getNamedPlacesList(formID),
      this.informalTaxonApi.informalTaxonGroupGetTree(this.translateService.currentLang).pipe(map(result => result.results)),
      this.translateService.get(allTranslations, {separator: MappingService.valueSplitter}).pipe(
        map(translated => Object.keys(this.instructionMapping).reduce((cumulative, current) => {
          if (translated[this.instructionMapping[current]]) {
            cumulative[current] = translated[this.instructionMapping[current]];
          }
          return cumulative;
        }, {[this.instructionArray]: translated[this.instructionArray]})))
    ).pipe(
      map((data) => ({person: data[0], namedPlaces: data[1], informalTaxonGroups: data[2], translations: data[3]}))
    )
      .subscribe((data) => {
        const sheet = XLSX.utils.aoa_to_sheet(this.fieldsToAOA(fields, useLabels, data));
        const book = XLSX.utils.book_new();

        const validationSheet = this.addMetaDataToSheet(fields, sheet, data, useLabels);
        validationSheet['!protect'] = {password: '¡secret!'};

        XLSX.utils.book_append_sheet(book, sheet, this.sheetNames.base);
        XLSX.utils.book_append_sheet(book, this.getInstructionSheet(fields, data.translations), this.sheetNames.info);
        XLSX.utils.book_append_sheet(book, validationSheet, this.sheetNames.vars);

        this.exportService.exportArrayBuffer(XLSX.write(book, {bookType: type, type: 'array'}), filename, type);
        next();
      }, () => next());

  }

  private fieldsToAOA(fields: IFormField[], useLabels: boolean, specials: {person: Person}) {
    const result = [[], []];
    let idx = -1;
    fields.map((field) => {
      idx++;
      const special = this.mappingService.getSpecial(field);
      let value = field.default;

      switch (special) {
        case SpecialTypes.person:
          const person = specials.person || {};
          value = `${person.fullName} (${person.id})`;
          break;
      }

      if (useLabels && field.enum && field.default) {
        const valueIdx = field.enum.indexOf(field.default);
        value = field.enumNames[valueIdx];
      } else if (field.type === 'boolean') {
        value = this.mappingService.reverseMap(value, field);
      }
      if (field.splitType) {
        switch (field.splitType) {
          case 'date':
            result[0][idx] = field.fullLabel.replace(field.label, field.label + GeneratorService.splitDate.dd);
            result[1][idx] = '';
            idx++;
            result[0][idx] = field.fullLabel.replace(field.label, field.label + GeneratorService.splitDate.mm);
            result[1][idx] = '';
            idx++;
            result[0][idx] = field.fullLabel.replace(field.label, field.label + GeneratorService.splitDate.yyyy);
            result[1][idx] = '';
            break;
          case 'coordinate':
            result[0][idx] = field.fullLabel.replace(field.label, field.label + GeneratorService.splitCoordinate.N);
            result[1][idx] = '';
            idx++;
            result[0][idx] = field.fullLabel.replace(field.label, field.label + GeneratorService.splitCoordinate.E);
            result[1][idx] = '';
            idx++;
            result[0][idx] = field.fullLabel.replace(field.label, field.label + GeneratorService.splitCoordinate.system);
            result[1][idx] = '';
        }
      } else {
        result[0][idx] = field.fullLabel;
        result[1][idx] = value;
      }
    });
    return result;
  }

  private addMetaDataToSheet(
    fields: IFormField[],
    sheet: XLSX.WorkSheet,
    extra: {person: Person, namedPlaces: string[], informalTaxonGroups: InformalTaxonGroup[]},
    useLabels: boolean
  ) {
    const validation = [];
    const vSheet = [];
    const cache = {};
    let vColumn = 0;
    let idx = -1;
    fields.map((field) => {
      idx++;
      let dataRange = XLSX.utils.encode_range({r: 1, c: idx}, {r: 1000, c: idx});
      const special = this.mappingService.getSpecial(field);
      let validValues;

      const addValidator = (skipSort = false) => {
        if (validValues) {
          const cacheKey = JSON.stringify(validValues);
          if (!cache[cacheKey]) {
            if (!skipSort) {
              validValues.sort();
            }
            this.addToValidationSheetData(validValues, vColumn, vSheet);
            cache[cacheKey] = this.sheetNames.vars + '!' + this.makeExactRange(
              XLSX.utils.encode_range({r: 0, c: vColumn}, {r: validValues.length - 1, c: vColumn})
            );
            vColumn++;
          }
          validation.push({
            sqref: dataRange,
            sqtarget: cache[cacheKey]
          });
        }
      };

      if (field.splitType === 'date') {
        validValues = Array.from({length: 31}, (v, i) => i + 1);
        addValidator(true);
        idx ++;
        dataRange = XLSX.utils.encode_range({r: 1, c: idx}, {r: 1000, c: idx});
        validValues = Array.from({length: 12}, (v, i) => i + 1);
        addValidator(true);
        idx ++;
        const year = new Date().getFullYear();
        dataRange = XLSX.utils.encode_range({r: 1, c: idx}, {r: 1000, c: idx});
        validValues = Array.from({length: 50}, (v, i) => year - i);
        addValidator(true);
        return;
      } else if (field.splitType === 'coordinate') {
        idx += 2;
        dataRange = XLSX.utils.encode_range({r: 1, c: idx}, {r: 1000, c: idx});
        validValues = GeneratorService.splitCoordinateSystems;
        addValidator();
        return;
      }

      if (field.enum) {
        validValues = (useLabels ? field.enumNames : field.enum).filter(val => val !== '');
      } else if (field.type === 'boolean') {
        validValues = [this.mappingService.mapFromBoolean(true), this.mappingService.mapFromBoolean(false)];
      } else if (special) {
        switch (special) {
          case SpecialTypes.namedPlaceID:
            if (Array.isArray(extra.namedPlaces) && extra.namedPlaces.length > 0) {
              validValues = extra.namedPlaces;
            }
            break;
          case SpecialTypes.informalTaxonGroupID:
            if (Array.isArray(extra.informalTaxonGroups) && extra.informalTaxonGroups.length > 0) {
              validValues = MappingService.informalTaxonGroupsToList(extra.informalTaxonGroups);
            }
            break;
        }
      }
      addValidator();
    });
    if (validation.length > 0) {
      sheet['!dataValidation'] = validation;
    }
    return XLSX.utils.aoa_to_sheet(vSheet);
  }

  private getInstructionSheet(fields: IFormField[], translations: {[key: string]: string}) {
    const vSheet = [];
    const given = {};
    let labelColLen = 10;
    let instructionColLen = 10;
    fields.forEach(field => {
      const label = field.label;
      if (given[label] || (!translations[field.key] && !translations[field.type] && !field.isArray)) {
        return;
      }
      given[label] = true;
      let instruction = translations[field.key] || translations[field.type];
      if (field.isArray) {
        instruction = (instruction ? instruction + ' ' : '') + translations[this.instructionArray];
      }
      if (label.length > labelColLen) {
        labelColLen = label.length;
      }
      if (instruction.length > instructionColLen) {
        instructionColLen = instruction.length;
      }
      vSheet.push([label, instruction]);
    });
    vSheet.sort((a, b) => {
      return a[0].localeCompare(b[0]);
    });
    const sheet = XLSX.utils.aoa_to_sheet(vSheet);
    sheet['!cols'] = [
      {wch: labelColLen},
      {wch: instructionColLen}
    ];

    return sheet;
  }

  private makeExactRange(range) {
    return range.split(':').map(cell => cell.replace(/^([A-Z]+)([0-9]+)$/, '$$$1$$$2')).join(':');
  }

  private addToValidationSheetData(valid: string[], vColumn, vSheet) {
    let current = 0;
    for (const validItem of valid) {
      if (!vSheet[current]) {
        vSheet[current] = [];
      }
      vSheet[current][vColumn] = validItem;
      current++;
    }
  }
}
