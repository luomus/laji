import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import {FormField} from '../model/form-field';
import { UserService} from '../../../shared/service';
import {MappingService, SpeciesTypes} from './mapping.service';
import {Person} from '../../../shared/model';
import {Observable} from 'rxjs/Observable';
import {NamedPlacesService} from '../../../shared-modules/named-place/named-places.service';
import {NamedPlace} from '../../../shared/model/NamedPlace';

@Injectable()
export class GeneratorService {

  private odsMimeType = 'application/vnd.oasis.opendocument.spreadsheet';
  private xlsxMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';


  constructor(
    private mappingService: MappingService,
    private userService: UserService,
    private namedPlaces: NamedPlacesService
  ) { }

  generate(filename: string, fields: FormField[], useLabels = true, type: 'ods' | 'xlsx' = 'xlsx', next: () => void = () => {}) {
    Observable.forkJoin(
      this.userService.getUser(),
      this.namedPlaces.getAllNamePlaces({
        userToken: this.userService.getToken(),
        includePublic: false
      }),
      (person, namedPlaces) => ({person: person, namedPlaces: namedPlaces})
    )
      .subscribe((data) => {
        const sheet = XLSX.utils.aoa_to_sheet(this.fieldsToAOA(fields, useLabels, data));
        const book = XLSX.utils.book_new();

        const validationSheet = this.addMetaDataToSheet(fields, sheet, data, useLabels);
        XLSX.utils.book_append_sheet(book, sheet);
        XLSX.utils.book_append_sheet(book, validationSheet);

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
        case SpeciesTypes.person:
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
          case SpeciesTypes.namedPlaceID:
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
          cache[cacheKey] = 'Sheet2!' + this.makeExactRange(
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
