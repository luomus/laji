import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { IFormField, splitType } from '../model/excel';
import { UserService } from '../../../shared/service/user.service';
import { MappingService, SpecialTypes } from './mapping.service';
import { Person } from '../../../shared/model/Person';
import { InformalTaxonGroup } from '../../../shared/model/InformalTaxonGroup';
import { forkJoin as ObservableForkJoin } from 'rxjs';
import { NamedPlacesService } from '../../../shared/service/named-places.service';
import { TranslateService } from '@ngx-translate/core';
import { InformalTaxonGroupApi } from '../../../shared/api/InformalTaxonGroupApi';
import { ExportService } from '../../../shared/service/export.service';
import { map, take } from 'rxjs/operators';
import { ExcelToolService } from './excel-tool.service';

@Injectable()
export class GeneratorService {

  public static splitDate = {
    dd: '@dd',
    mm: '@mm',
    yyyy: '@yyyy'
  };

  public static splitCoordinate = {
    N: '@N',
    E: '@E',
    system: '@System',
    sys: '@sys'
  };

  public static splitCoordinateSystem = {
    ykj: 'ykj',
    wgs84: 'wgs84',
    etrs: 'ETRS-TM35FIN',
  };
  public static splitCoordinateSystems = [
    GeneratorService.splitCoordinateSystem.ykj,
    GeneratorService.splitCoordinateSystem.etrs,
    GeneratorService.splitCoordinateSystem.wgs84
  ];

  public static splittableFields: {[key: string]: splitType} = {
    'gatheringEvent.dateBegin': 'date',
    'gatheringEvent.dateEnd': 'date',
    'gatherings[*].geometry': 'coordinate',
  };

  private sheetNames = {
    'base': 'excel.sheet.base',
    'vars': 'excel.sheet.variables', // This name cannot have spaces in it
    'info': 'excel.sheet.info'
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
    ObservableForkJoin(
      this.userService.user$.pipe(take(1)),
      this.excelToolService.getNamedPlacesList(formID),
      this.informalTaxonApi.informalTaxonGroupGetTree(this.translateService.currentLang).pipe(map(result => result.results))
    ).pipe(
      map((data) => ({person: data[0], namedPlaces: data[1], informalTaxonGroups: data[2]}))
    )
      .subscribe((data) => {
        const sheet = XLSX.utils.aoa_to_sheet(this.fieldsToAOA(fields, useLabels, data));
        const book = XLSX.utils.book_new();

        const validationSheet = this.addMetaDataToSheet(fields, sheet, data, useLabels);
        validationSheet['!protect'] = {password: '¡secret!'};

        XLSX.utils.book_append_sheet(book, sheet, this.translateService.instant(this.sheetNames.base));
        XLSX.utils.book_append_sheet(book, this.getInstructionSheet(fields), this.translateService.instant(this.sheetNames.info));
        XLSX.utils.book_append_sheet(book, validationSheet, this.translateService.instant(this.sheetNames.vars));

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
          const person = specials.person || {};
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
        const labels = this.getSplitFieldLabels(field.fullLabel, field.label, field.splitType);
        labels.forEach((label, i) => {
          result[0][idx] = label;
          result[1][idx] = '';
          if (i !== labels.length - 1) {
            idx++;
          }
        });
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
            cache[cacheKey] = this.translateService.instant(this.sheetNames.vars) + '!' + this.makeExactRange(
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

  private getInstructionSheet(fields: IFormField[]) {
    const vSheet = [];
    let labelColLen = 10;
    let instructionColLen = 10;

    fields.forEach(field => {
      const columns: {label: string, isArray: boolean, separators?: string[]}[] = [];
      if (field.splitType) {
        const labels = this.getSplitFieldLabels(field.fullLabel, field.label, field.splitType);
        labels.forEach(label => {
          columns.push({label, isArray: false});
        });
      } else if (field.isArray) {
        const separators = this.mappingService.getSpecial(field) === SpecialTypes.keywords ? MappingService.keywordSplitters : [MappingService.valueSplitter];
        columns.push({label: field.fullLabel, isArray: true, separators});
      } else {
        columns.push({label: field.fullLabel, isArray: false});
      }

      columns.forEach(col => {
        const label = col.label;
        let instruction = '';
        if (col.isArray) {
          instruction = (instruction ? instruction + ' ' : '') + this.translateService.instant('excel.info.array', {
            separators: col.separators.join('')
          });
        }
        if (label.length > labelColLen) {
          labelColLen = label.length;
        }
        if (instruction.length > instructionColLen) {
          instructionColLen = instruction.length;
        }
        vSheet.push([label, instruction]);
      });
    });

    const generalInstructions = this.translateService.instant('excel.info.file');
    vSheet.unshift([]);
    vSheet.unshift([generalInstructions]);

    const sheet = XLSX.utils.aoa_to_sheet(vSheet);
    sheet['!cols'] = [
      {wch: Math.max(labelColLen, generalInstructions.length)},
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

  private getSplitFieldLabels(fullLabel: string, label: string, type: splitType) {
    switch (type) {
      case 'date':
        return [GeneratorService.splitDate.dd, GeneratorService.splitDate.mm, GeneratorService.splitDate.yyyy].map(
          splitKey => this.getSplitFieldLabel(fullLabel, label, splitKey)
        );
      case 'coordinate':
        return [GeneratorService.splitCoordinate.N, GeneratorService.splitCoordinate.E, GeneratorService.splitCoordinate.system].map(
          splitKey => this.getSplitFieldLabel(fullLabel, label, splitKey)
        );
    }
  }

  private getSplitFieldLabel(fullLabel: string, label: string, splitKey: string) {
    return fullLabel.replace(label, label + splitKey);
  }
}
