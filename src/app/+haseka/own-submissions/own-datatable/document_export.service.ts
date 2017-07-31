import { Injectable } from '@angular/core';
import { Document } from '../../../shared/model/Document';
import { Util } from '../../../shared/service/util.service';
import { TriplestoreLabelService } from '../../../shared/service/triplestore-label.service';
import { UserService } from '../../../shared/service/user.service';
import { CollectionService } from '../../../shared/service/collection.service';
import { FormService } from '../../../shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { DocumentInfoService } from '../../document-info.service';
import { geoJSONToISO6709 } from 'laji-map/lib/utils';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class DocumentExportService {
  private readonly extraFields = ['id', 'formID', 'dateCreated', 'dateEdited'];
  private readonly classPrefixes = {formID: 'MY', dateCreated: 'MZ', dateEdited: 'MZ'};
  private readonly valuePrefixes = {collection: 'HR', person: 'MA'};

  constructor(
    private translate: TranslateService,
    private labelService: TriplestoreLabelService,
    private userService: UserService,
    private collectionService: CollectionService,
    private formService: FormService
  ) {}

  public downloadDocuments(docs: Document[], year: number, type: string) {
    this.getBuffer(docs, type).subscribe((buffer) => {
      this.translate.get('haseka.submissions.submissions').subscribe((msg) => {
        const fileName = msg + '_' + year;
        this.downloadData(buffer, fileName, type);
      });
    });
  }

  public downloadDocument(doc: Document, type: string) {
    this.getBuffer([doc], type).subscribe((buffer) => {
      this.translate.get('haseka.submissions.submission').subscribe((msg) => {
        const fileName = msg + '_' + doc.id.split('.')[1];
        this.downloadData(buffer, fileName, type);
      });
    });
  }

  private downloadData(buffer: any, fileName: string, fileExtension: string) {
    let type;

    if (fileExtension === 'ods') {
      type = 'application/vnd.oasis.opendocument.spreadsheet';
    } else if (fileExtension === 'xlsx') {
      type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else {
      type = 'text/csv;charset=utf-8';
    }

    const data: Blob = new Blob([buffer], {
      type: type
    });

    FileSaver.saveAs(data, fileName + '.' + fileExtension);
  }

  private getBuffer(docs: Document[], type): Observable<string> {
    return this.getJsonForms(docs)
      .switchMap((jsonForms) => {
        return this.getFields(docs, jsonForms)
          .switchMap((fields) => {
            const dataObservables = docs.map((doc) => (this.getData(Util.clone(doc), jsonForms[doc.formID], fields)));
            return Observable.forkJoin(dataObservables)
              .map((data) => {
                const mergedData = [].concat.apply([], data);

                const aoa = this.convertDataToAoA(fields, mergedData);
                const sheet = XLSX.utils.aoa_to_sheet(aoa);

                if (type === 'csv') {
                  return XLSX.utils.sheet_to_csv(sheet);
                }

                const book = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(book, sheet);

                return XLSX.write(book, {bookType: type, type: 'buffer'});
              });
          });
      });
  }

  private getJsonForms(docs: Document[], jsonForms = {}, idx = 0): Observable<any> {
    if (idx >= docs.length) {
      return Observable.of(jsonForms);
    }

    const formId = docs[idx].formID;

    if (jsonForms[formId]) {
      return this.getJsonForms(docs, jsonForms, idx + 1);
    }

    return this.formService.getFormInJSONFormat(formId, this.translate.currentLang)
      .switchMap((jsonForm) => {
        jsonForms[formId] = jsonForm;
        return this.getJsonForms(docs, jsonForms, idx + 1);
      });
  }

  private convertDataToAoA(fields: any, data: any) {
    const getValueByPath = (o: any, path: string) => {
      const splits = path.split('.');
      for (let i = 0; i < splits.length; i++) {
        o = o[splits[i]];

        if (!o) { return ''; }
      }

      return o;
    };

    if (fields.length < 1) { return []; }

    const aoa = [[]];

    for (let i = 0; i < fields.length; i++) {
      aoa[0].push(fields[i].label);
    }

    for (let i = 0; i < data.length; i++) {
      const obj = data[i];
      aoa.push([]);

      for (let j = 0; j < fields.length; j++) {
        aoa[i + 1].push(getValueByPath(obj, fields[j].value));
      }
    }

    return aoa;
  }

  private getData(obj: any, form: any, fields: any, path = ''): Observable<any> {
    let unwindKey;
    const observables = [];

    for (const key in obj) {
      if (!obj.hasOwnProperty(key)) { continue; }

      const fieldArray = fields.filter((f) => (f.value === path + key));
      const child = obj[key];

      if (fieldArray.length > 0) {
        observables.push(this.getLabelToValue(key, obj[key], fieldArray[0])
          .do((label) => {
            obj[key] = label;
          }));
      } else if (Array.isArray(child) && typeof child[0] === 'object') {
        unwindKey = key;
      } else if (typeof child === 'object' && key !== 'geometry') {
        observables.push(this.getData(child, form, fields, path + key + '.'));
      }
    }

    const observable = observables.length > 0 ? Observable.forkJoin(observables) : Observable.of([]);

    return observable.switchMap(
      () => {
        if (unwindKey) {
          const getDataObservables = [];
          for (let i = 0; i < obj[unwindKey].length; i++) {
            if (!this.isEmpty(unwindKey, obj[unwindKey][i], form)) {
              getDataObservables.push(this.getData(obj[unwindKey][i], form, fields, path + unwindKey + '.'));
            }
          }

          if (getDataObservables.length > 0) {
            return Observable.forkJoin(getDataObservables)
              .map((arrays) => {
                obj[unwindKey] = [].concat.apply([], arrays);
                return this.unwind(unwindKey, obj);
              });
          } else {
            return Observable.of(this.unwind(unwindKey, obj));
          }
        } else {
          return Observable.of([obj]);
        }
      });
  }

  private unwind(key: string, obj: any) {
    const result = [];

    for (let i = 0; i < obj[key].length; i++) {
      result.push(Util.clone(obj));
      result[i][key] = obj[key][i];
    }

    return result;
  }

  private getFields(docs: Document[], jsonForms: any): Observable<any[]> {
    const queue = docs.map((doc) => ({obj: doc, key: 'document', path: '', formId: doc.formID}));
    let next, obj, key, path, formId;
    const fields = [];
    const labelObservables$ = [];

    while (queue.length > 0) {
      next = queue.shift();
      obj = next.obj;
      key = next.key;
      path = next.path;
      formId = next.formId;

      for (const i in obj) {
        if (!obj.hasOwnProperty(i) || obj[i] == null || i.charAt(0) === '@'
          || (Array.isArray(obj[i]) && obj[i].length < 1)) {
          continue;
        }

        const field = path + i;

        if (i === 'geometry' || typeof obj[i] !== 'object' || (Array.isArray(obj[i]) && typeof obj[i][0] !== 'object')) {
          if (fields.filter((f) => (f.value === field)).length > 0) { continue; }

          const properties = this.getFieldProperties(field, jsonForms[formId]);
          const extraFieldIdx = this.extraFields.indexOf(field);

          if (properties) {
            fields.push(Object.assign({value: field}, properties));
          } else if (extraFieldIdx > -1) {
            const capitalizedKey = i.charAt(0).toUpperCase() + i.slice(1);
            const fieldData = {
              value: field,
              label: capitalizedKey,
              sortIdx: extraFieldIdx - this.extraFields.length
            };
            fields.push(fieldData);
            if (i !== 'id') {
              labelObservables$.push(this.getLabel(i).do((label) => {if (label !== i) {fieldData.label = label; }}));
            }
          }
        } else if (Array.isArray(obj[i])) {
          for (let j = 0; j < obj[i].length; j++) {
            if (!this.isEmpty(i, obj[i][j], jsonForms[formId])) {
              queue.push({obj: obj[i][j], key: i, path: path + i + '.', formId: formId});
            }
          }
        } else {
          queue.push({obj: obj[i], key: i, path: path + i + '.', formId: formId});
        }
      }
    }

    // this.sortFieldData(fields, jsonForm);

    return Observable.forkJoin(labelObservables$)
      .map(() => (fields));
  }

  /*private sortFieldData(fields: any[], doc: Document, jsonForm: any) {
    fields.sort((a, b) => {
      const aPath = a.value.substring(0, a.value.lastIndexOf('.'));
      const bPath =  b.value.substring(0, b.value.lastIndexOf('.'));

      if (aPath === bPath) {
        return a.sortIdx - b.sortIdx;
      }

      const aParts = a.value.split('.');
      const bParts = b.value.split('.');
      let commonPath = '';
      let i = 0;

      while (i < aParts.length && i < bParts.length && aParts[i] === bParts[i]) {
        commonPath += aParts[i] + '.';
        i++;
      }

      if (Array.isArray(aObj) && typeof aObj[0] === 'object') {
        return 1;
      } else if (Array.isArray(bObj) && typeof bObj[0] === 'object') {
        return -1;
      }

      let aSortIdx = a.sortIdx;
      let bSortIdx = b.sortIdx;

      if (i !== aParts.length - 1 && aParts[i] !== 'geometry' && typeof aObj === 'object') {
        const props = this.getFieldProperties(commonPath + '.' + aParts[i], jsonForm);
        aSortIdx = props ? props.sortIdx : 10000;
      }

      if (i !== bParts.length - 1 && bParts[i] !== 'geometry' && typeof bObj === 'object') {
        const props = this.getFieldProperties(commonPath + '.' + bParts[i], jsonForm);
        bSortIdx = props ? props.sortIdx : 10000;
      }

      return aSortIdx - bSortIdx;
    });
  }*/

  private getFieldProperties(field: string, jsonForm: any): any {
    const splitted = field.split('.');
    const key = splitted[splitted.length - 1];

    let properties = jsonForm.fields;
    let fieldProperties;

    for (let i = 0; i < splitted.length; i++) {
      for (let j = 0; j < properties.length; j++) {
        if (splitted[i] === properties[j].name) {
          if (i === splitted.length - 1) {
            fieldProperties = {label: properties[j].label, sortIdx: j};

            if (properties[j].options && properties[j].options.value_options) {
              fieldProperties.enums = properties[j].options.value_options;
            }
          } else {
            properties = properties[j].fields;
          }
          break;
        }
      }
    }
    return fieldProperties;
  }

  private getLabelToValue(key: string, obj: any, fieldData?: any): Observable<any> {
    let value = '';

    if (obj != null) {
      if (key === 'geometry') {
        value += geoJSONToISO6709({
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: obj,
          }]}).replace(/\n$/, '');
      } else if (Array.isArray(obj)) {
        return Observable.from(obj.map((labelKey) => {
          return this.getLabel(labelKey, fieldData);
        }))
          .mergeAll()
          .toArray()
          .map((array) => {
            return array.join(', ');
          });
      } else {
        return this.getLabel(obj, fieldData);
      }
    }

    return Observable.of(value);
  }

  private getLabel(key: string, fieldData?: any): Observable<string> {
    if (typeof key !== 'string') {
      return Observable.of(String(key));
    }

    if (fieldData && fieldData.enums && fieldData.enums[key]) {
      return Observable.of(fieldData.enums[key]);
    }

    if (key.match(new RegExp('^' + this.valuePrefixes.person + '\.[0-9]+$'))) {
      return this.userService
        .getUser(key)
        .map((user) => {
          return user.fullName || key;
        });
    }
    if (key.match(new RegExp('^' + this.valuePrefixes.collection + '\.[0-9]+$'))) {
      return this.collectionService
        .getName(key, this.translate.currentLang)
        .map((name) => {
          return name.length > 0 && name[0].value ? name[0].value : key;
        });
    }

    if (this.classPrefixes[key]) {
      key = this.classPrefixes[key] + '.' + key;
      return this.labelService
        .get(key, this.translate.currentLang)
        .map((label) => {
          return label || key;
        });
    }

    return Observable.of(key);
  }

  private isEmpty(key: string, obj: any, form: any) {
    if (key === 'gatherings') {
      if (!obj.units || obj.units.length < 1) { return true; }

      for (let i = 0; i < obj.units.length; i++) {
        if (!DocumentInfoService.isEmptyUnit(obj.units[i], form)) { return false; }
      }

      return true;
    } else if (key === 'units') {
      return DocumentInfoService.isEmptyUnit(obj, form);
    }

    return false;
  }
}
