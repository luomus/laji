import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { environment } from '../../../../environments/environment';
import { TriplestoreLabelService } from '../../../shared/service';

import { FormField } from '../model/form-field';
import { MappingService } from './mapping.service';

@Injectable()
export class SpreadSheetService {

  private odsMimeType = 'application/vnd.oasis.opendocument.spreadsheet';
  private xlsxMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  private translations = {};

  constructor(
    private mappingService: MappingService,
    private labelService: TriplestoreLabelService,
    private translateService: TranslateService
  ) {
    this.translateService.onLangChange
      .map(() => this.translateService.currentLang)
      .startWith(this.translateService.currentLang)
      .distinctUntilChanged()
      .switchMap((lang) => Observable.combineLatest(
        this.labelService.get('MY.document', lang),
        this.labelService.get('MZ.gatheringEvent', lang),
        this.labelService.get('MY.taxonCensusClass', lang),
        this.labelService.get('MY.gathering', lang),
        this.labelService.get('MY.gatheringFactClass', lang),
        this.labelService.get('MY.identification', lang),
        this.labelService.get('MY.unit', lang),
        this.labelService.get('MY.unitFactClass', lang),
        (
          document,
          gatheringEvent,
          taxonCensus,
          gatherings,
          gatheringFact,
          identifications,
          units,
          unitFact
        ) => ({
          document,
          gatheringEvent,
          taxonCensus,
          gatherings,
          gatheringFact,
          identifications,
          units,
          unitFact
        })))
      .subscribe(translations => this.translations = translations)

  }

  generate(filename: string, fields: FormField[], useLabels = true, type: 'ods' | 'xlsx' = 'xlsx') {
    const sheet = XLSX.utils.aoa_to_sheet(this.fieldsToAOA(fields, useLabels));
    const book = XLSX.utils.book_new();

    this.addMetaDataToSheet(fields, sheet, useLabels);
    XLSX.utils.book_append_sheet(book, sheet);

    this.downloadData(XLSX.write(book, {bookType: type, type: 'buffer'}), filename, type);
  }

  formToFlatFields(form: any): FormField[] {
    const result = [];
    if (form && form.schema && form.schema.properties) {
      this.parserFields(form.schema, {properties: form.validators}, result, '', 'document');
    }
    return result;
  }

  private parserFields(form: any, validators: any, result: FormField[], root, parent, lastKey = '', lastLabel = '', required = []) {
    if (!form || !form.type || (form.options && form.options.excludeFromSpreadSheet)) {
      return;
    }
    switch (form.type) {
      case 'object':
        if (form.properties) {
          let found = false;
          Object.keys(form.properties).map(key => {
            found = true;
            this.parserFields(
              form.properties[key],
              validators.properties && validators.properties && validators.properties[key] || {},
              result,
              root ? root + '.' + key : key,
              form.properties[key].type === 'object' && Object.keys(form.properties[key].properties).length > 0 ? key : parent,
              key,
              form.title || lastLabel,
              form.required || []
            )
          });
          if (!found) {
            result.push({
              type: form.type,
              label: form.title || lastLabel,
              key: root,
              parent: parent,
              required: this.hasRequiredValidator(lastKey, validators, required),
              enum: form.enum,
              enumNames: form.enumNames,
              default: form.default
            });
          }
        }
        break;
      case 'array':
        if (form.items) {
          const newParent = ['object', 'array'].indexOf(form.items.type) > -1 ? lastKey : parent;
          this.parserFields(form.items, validators.items || validators, result, root + '[*]', newParent, lastKey, form.title || lastLabel);
        }
        break;
      default:
        result.push({
          type: form.type,
          label: form.title || lastLabel,
          key: root,
          parent: parent,
          required: this.hasRequiredValidator(lastKey, validators, required),
          enum: form.enum,
          enumNames: form.enumNames,
          default: form.default
        });
    }
  }

  setDateFormat(sheet: XLSX.WorkSheet) {
    for (const i in sheet) {
      if (!sheet.hasOwnProperty(i) || !sheet[i].t || sheet[i].t !== 'd') {
        continue;
      }
      sheet[i].z = sheet[i].w.length <= 10 ? 'YYYY-MM-DD' : 'YYYY-MM-DD hh:mm:ss';
      delete sheet[i].w;
    }
  }

  getColMapFromComments(sheet: XLSX.WorkSheet, fields: FormField[]) {
    let idx = 0, col;
    const lookup = {};
    fields.map((field, index) => {
      lookup[field.key.toLocaleUpperCase()] = index;
      lookup[this.sheetHeaderLabel(field).toLocaleUpperCase()] = index;
    });
    const map = {};
    let address = XLSX.utils.encode_cell({r: 0, c: idx});
    while (col = sheet[address]) {
      let found = false;
      if (Array.isArray(col.c)) {
        for (let i = 0; i < col.c.length; i++) {
          if (col.c.t) {
            const comment = col.c.t.toLocaleLowerCase();
            if (typeof lookup[comment] !== 'undefined') {
              map[XLSX.utils.encode_col(idx)] = lookup[comment];
              found = true;
              break;
            }
          }
        }
        if (found) {
          break;
        }
      }
      if (col.v) {
        const val = col.v.toLocaleUpperCase();
        if (typeof lookup[val] !== 'undefined') {
          map[XLSX.utils.encode_col(idx)] = lookup[val];
        }
      }
      address = XLSX.utils.encode_cell({r: 0, c: ++idx});
    }
    const keys = Object.keys(map);
    keys.map((key) => {
      fields[map[key]].col = key;
    });
    return map;
  }

  findFormIdFromFilename(filename: string): string {
    for (const id of environment.massForms) {
      const regEx = new RegExp('\\b' + id + '\\b');
      if (regEx.test(filename)) {
        return id;
      }
    }
    return '';
  }


  private hasRequiredValidator(lastKey, validator, required) {
    return !!validator.presence || (validator.geometry && validator.geometry.requireShape) || required.indexOf(lastKey) > -1;
  }

  private addMetaDataToSheet(fields: FormField[], sheet: XLSX.WorkSheet, useLabels: boolean) {
    const validation = [];
    fields.map((field, idx) => {
      const headerAddress = XLSX.utils.encode_cell({r: 0, c: idx});
      const dataRange = XLSX.utils.encode_range({r: 1, c: idx}, {r: 1000, c: idx});
      const headerCell = sheet[headerAddress];

      if (!headerCell.c) {
        headerCell.c = [];
      }
      headerCell.c.push({a: 'laji.fi', t: field.key});

      if (field.enum) {
        validation.push({
          sqref: dataRange,
          values: (useLabels ? field.enumNames : field.enum).filter(value => value !== '')
        })
      } else if (field.type === 'boolean') {
        validation.push({
          sqref: dataRange,
          values: [
            this.mappingService.mapBoolean(true),
            this.mappingService.mapBoolean(false)
          ]
        })
      }
    });
    if (validation.length > 0) {
      sheet['!dataValidation'] = validation;
    }
  }

  private fieldsToAOA(fields: FormField[], useLabels: boolean) {
    const result = [[], []];
    fields.map((field, idx) => {
      let value = field.default;

      if (useLabels && field.enum && field.default) {
        const valueIdx = field.enum.indexOf(field.default);
        value = field.enumNames[valueIdx];
      } else if (field.type === 'boolean') {
        value = this.mappingService.reverseMap(value, field)
      }
      result[0][idx] = this.sheetHeaderLabel(field);
      result[1][idx] = value;
    });
    return result;
  }

  private sheetHeaderLabel(field: FormField) {
    return field.label + ' - ' + this.translations[field.parent] || field.parent;
  }

  private downloadData(buffer: any, fileName: string, fileExtension: string) {
    const type = fileExtension === 'ods' ? this.odsMimeType : this.xlsxMimeType;

    const data: Blob = new Blob([buffer], {
      type: type
    });

    FileSaver.saveAs(data, fileName + '.' + fileExtension);
  }

}
