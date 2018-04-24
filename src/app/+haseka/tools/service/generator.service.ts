import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import {FormField} from '../model/form-field';
import { UserService} from '../../../shared/service';
import {MappingService, SpecialTypes} from './mapping.service';
import {Person} from '../../../shared/model';
import {Observable} from 'rxjs/Observable';
import {NamedPlacesService} from '../../../shared-modules/named-place/named-places.service';
import {NamedPlace} from '../../../shared/model/NamedPlace';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class GeneratorService {

  private odsMimeType = 'application/vnd.oasis.opendocument.spreadsheet';
  private xlsxMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

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
  ) { }

  generate(filename: string, fields: FormField[], useLabels = true, type: 'ods' | 'xlsx' = 'xlsx', next: () => void = () => {}) {
    const allTranslations = Object.keys(this.instructionMapping).map(key => this.instructionMapping[key]);
    allTranslations.push(this.instructionArray);
    Observable.forkJoin(
      this.userService.getUser(),
      this.namedPlaces.getAllNamePlaces({
        userToken: this.userService.getToken(),
        includePublic: false
      }),
      this.translateService.get(allTranslations, {separator: MappingService.valueSplitter})
        .map(translated => Object.keys(this.instructionMapping).reduce((cumulative, current) => {
          if (translated[this.instructionMapping[current]]) {
            cumulative[current] = translated[this.instructionMapping[current]];
          }
          return cumulative;
        }, {[this.instructionArray]: translated[this.instructionArray]}))
      ,
      (person, namedPlaces, translations) => ({person, namedPlaces, translations})
    )
      .subscribe((data) => {
        const sheet = XLSX.utils.aoa_to_sheet(this.fieldsToAOA(fields, useLabels, data));
        const book = XLSX.utils.book_new();

        const validationSheet = this.addMetaDataToSheet(fields, sheet, data, useLabels);
        validationSheet['!protect'] = {password: '¡secret!'};

        XLSX.utils.book_append_sheet(book, sheet, this.sheetNames.base);
        XLSX.utils.book_append_sheet(book, this.getInstructionSheet(fields, data.translations), this.sheetNames.info);
        XLSX.utils.book_append_sheet(book, validationSheet, this.sheetNames.vars);

        this.downloadData(XLSX.write(book, {bookType: type, type: 'buffer'}), filename, type);
        next();
      }, () => next());

  }

  private fieldsToAOA(fields: FormField[], useLabels: boolean, specials: {person: Person}) {
    const result = [[], []];
    fields.map((field, idx) => {
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
        value = this.mappingService.reverseMap(value, field)
      }
      result[0][idx] = field.fullLabel;
      result[1][idx] = value;
    });
    return result;
  }

  private addMetaDataToSheet(
    fields: FormField[],
    sheet: XLSX.WorkSheet,
    extra: {person: Person, namedPlaces: NamedPlace[]},
    useLabels: boolean
  ) {
    const validation = [];
    const vSheet = [];
    const cache = {};
    let vColumn = 0;
    fields.map((field, idx) => {
      const headerAddress = XLSX.utils.encode_cell({r: 0, c: idx});
      const dataRange = XLSX.utils.encode_range({r: 1, c: idx}, {r: 1000, c: idx});
      const headerCell = sheet[headerAddress];
      const special = this.mappingService.getSpecial(field);

      /* Comments do not work nicely with excel (leaves comments open on hover)
      if (!headerCell.c) {
        headerCell.c = [];
      }
      headerCell.c.push({a: 'laji.fi', t: field.key});
      */

      let validValues;
      if (field.enum) {
        validValues = (useLabels ? field.enumNames : field.enum).filter(val => val !== '');
      } else if (field.type === 'boolean') {
        validValues = [this.mappingService.mapFromBoolean(true), this.mappingService.mapFromBoolean(false)];
      } else if (special) {
        switch (special) {
          case SpecialTypes.namedPlaceID:
            if (extra.namedPlaces && extra.namedPlaces.length > 0) {
              validValues = extra.namedPlaces.map(namedPlace => `${namedPlace.name} (${namedPlace.id})`)
            }
            break;
        }
      }

      if (validValues) {
        const cacheKey = JSON.stringify(validValues);
        if (!cache[cacheKey]) {
          validValues.sort();
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
    });
    if (validation.length > 0) {
      sheet['!dataValidation'] = validation;
    }
    return XLSX.utils.aoa_to_sheet(vSheet);
  }

  private getInstructionSheet(fields: FormField[], translations: {[key: string]: string}) {
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

  private downloadData(buffer: any, fileName: string, fileExtension: string) {
    const type = fileExtension === 'ods' ? this.odsMimeType : this.xlsxMimeType;

    const data: Blob = new Blob([buffer], {
      type: type
    });

    FileSaver.saveAs(data, fileName + '.' + fileExtension);
  }
}
