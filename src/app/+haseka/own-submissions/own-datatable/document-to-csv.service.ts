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
import json2csv from 'json2csv/lib/json2csv';
import { Observable } from 'rxjs/Observable';

/**
 * Csv service
 */
@Injectable()
export class DocumentToCsvService {
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

  public downloadDocumentAsCsv(doc: Document) {
    this.formService.getFormInJSONFormat(doc.formID, this.translate.currentLang)
      .subscribe((jsonForm) => {
        this.getCsv(doc, jsonForm).subscribe((csv) => {

          this.translate.get('haseka.submissions.submission').subscribe((msg) => {
            const fileName = msg + '_' + doc.id.split('.')[1] + '.csv';
            this.downloadCsv(csv, fileName);
          });
        });
      });
  }

  private downloadCsv(csv: string, fileName: string) {
    const isIE = () => {
      const ua = window.navigator.userAgent;
      return /Trident/.test(ua) || /MSIE/.test(ua);
    };

    if (isIE()) {
      const IEwindow = window.open();
      IEwindow.document.write('sep=,\r\n' + csv);
      IEwindow.document.close();
      IEwindow.document.execCommand('SaveAs', true, fileName);
      IEwindow.close();
    } else {
      const uri = encodeURI(csv);
      const downloadLink = document.createElement('a');
      downloadLink.href = 'data:text/csv;charset=utf-8,' + uri;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  }

  private getCsv(doc: Document, form: any): Observable<string> {
    return this.getFields(doc, form)
      .switchMap((fields) => {
        return this.getData(Util.clone(doc), form, fields)
          .map((data) => {
            return json2csv({fields: fields, data: data});
          });
      });
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

  private getFields(doc: Document, jsonForm: any): Observable<any[]> {
    const queue = [{obj: doc, key: 'document', path: ''}];
    let next, obj, key, path;
    const fields = [];
    const labelObservables$ = [];

    while (queue.length > 0) {
      next = queue.shift();
      obj = next.obj;
      key = next.key;
      path = next.path;

      for (const i in obj) {
        if (!obj.hasOwnProperty(i) || obj[i] == null || i.charAt(0) === '@'
          || (Array.isArray(obj[i]) && obj[i].length < 1)) {
          continue;
        }

        const field = path + i;

        if (i === 'geometry' || typeof obj[i] !== 'object' || (Array.isArray(obj[i]) && typeof obj[i][0] !== 'object')) {
          if (fields.filter((f) => (f.value === field)).length > 0) { continue; }

          const properties = this.getFieldProperties(field, jsonForm);
          const extraFieldIdx = this.extraFields.indexOf(field);

          if (properties) {
            fields.push(Object.assign({value: field}, properties));
          } else if (extraFieldIdx > -1) {
            const capitalizedKey = i.charAt(0).toUpperCase() + i.slice(1);
            const fieldData = {value: field, label: capitalizedKey, sortIdx: extraFieldIdx - this.extraFields.length};
            fields.push(fieldData);
            if (i !== 'id') {
              labelObservables$.push(this.getLabel(i).do((label) => {if (label !== i) {fieldData.label = label; }}));
            }
          }
        } else if (Array.isArray(obj[i])) {
          for (let j = 0; j < obj[i].length; j++) {
            if (!this.isEmpty(i, obj[i][j], jsonForm)) {
              queue.push({obj: obj[i][j], key: i, path: path + i + '.'});
            }
          }
        } else {
          queue.push({obj: obj[i], key: i, path: path + i + '.'});
        }
      }
    }

    this.sortFieldData(fields, doc, jsonForm);

    return Observable.forkJoin(labelObservables$)
      .map(() => (fields));
  }

  private sortFieldData(fields: any[], doc: Document, jsonForm: any) {
    const getObj = (parts: string[], idx: number): any => {
      let obj = doc;
      for (let i = 0; i <= idx; i++) {
        if (Array.isArray(obj)) {
          for (let j = 0; j < obj.length; j++) {
            if (!this.isEmpty(parts[i - 1], obj[j], jsonForm)) {
              obj = obj[j];
              break;
            }
          }
        }
        obj = obj[parts[i]];
      }
      return obj;
    };

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

      const aObj = getObj(aParts, i);
      const bObj = getObj(bParts, i);

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
  }

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
