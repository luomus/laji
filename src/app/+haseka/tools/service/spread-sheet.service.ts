import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { TriplestoreLabelService } from '../../../shared/service';

import { FormField } from '../model/form-field';
import { MappingService } from './mapping.service';

@Injectable()
export class SpreadSheetService {

  private odsMimeType = 'application/vnd.oasis.opendocument.spreadsheet';
  private xlsxMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  constructor(
    private mappingService: MappingService,
    private labelService: TriplestoreLabelService,
    private translateService: TranslateService
  ) {

  }

  generate(filename: string, fields: FormField[], useLabels = true, type: 'ods' | 'xlsx' = 'xlsx') {
    const lang = this.translateService.currentLang;
    Observable.combineLatest(
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
      })
    ).subscribe(classTranslations => {
      const sheet = XLSX.utils.aoa_to_sheet(this.fieldsToAOA(fields, useLabels, classTranslations));
      const book = XLSX.utils.book_new();

      this.addMetaDataToSheet(fields, sheet, useLabels);
      XLSX.utils.book_append_sheet(book, sheet);

      this.downloadData(XLSX.write(book, {bookType: type, type: 'buffer'}), filename, type);
    });
  }

  formToFlatFields(form: any): FormField[] {
    const result = [];
    if (form && form.schema && form.schema.properties) {
      this.parserFields(form.schema, {properties: form.validators}, result, '', 'document');
    }
    return result;
  }

  private parserFields(form: any, validators: any, result: FormField[], root, parent, lastKey = '', lastLabel = '', required = []) {
    if (!form || !form.type) {
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
          this.parserFields(form.items, validators.items || validators, result, root + '[0]', newParent, lastKey, form.title || lastLabel);
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

  private fieldsToAOA(fields: FormField[], useLabels: boolean, translations: any) {
    const result = [[], []];
    fields.map((field, idx) => {
      let value = field.default;

      if (useLabels && field.enum && field.default) {
        const valueIdx = field.enum.indexOf(field.default);
        value = field.enumNames[valueIdx];
      } else if (field.type === 'boolean') {
        value = this.mappingService.reverseMap(value, field)
      }
      result[0][idx] = field.label + ' - ' + translations[field.parent] || field.parent;
      result[1][idx] = value;
    });
    return result;
  }

  private downloadData(buffer: any, fileName: string, fileExtension: string) {
    const type = fileExtension === 'ods' ? this.odsMimeType : this.xlsxMimeType;

    const data: Blob = new Blob([buffer], {
      type: type
    });

    FileSaver.saveAs(data, fileName + '.' + fileExtension);
  }

}
