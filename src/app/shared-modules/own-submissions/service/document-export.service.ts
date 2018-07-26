import { Injectable } from '@angular/core';
import { Document } from '../../../shared/model/Document';
import { Util } from '../../../shared/service/util.service';
import { TriplestoreLabelService } from '../../../shared/service/triplestore-label.service';
import { UserService } from '../../../shared/service/user.service';
import { CollectionService } from '../../../shared/service/collection.service';
import { FormService } from '../../../shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { geoJSONToISO6709 } from 'laji-map/lib/utils';
import { write as XLSXWrite, utils as XLSXUtils } from 'xlsx';
import { Observable, of as ObservableOf, forkJoin as ObservableForkJoin } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { DocumentInfoService } from './document-info.service';
import { ExportService } from '../../../shared/service/export.service';
import { DocumentFieldNode, DocumentField } from '../models/document-field';


@Injectable()
export class DocumentExportService {
  private readonly unwindPaths = ['gatherings', 'gatherings.units', 'gatherings.units.identifications'];
  private readonly extraFields = ['id', 'formID', 'dateCreated', 'dateEdited'];
  private readonly classPrefixes = {formID: 'MY', dateCreated: 'MZ', dateEdited: 'MZ'};
  private readonly valuePrefixes = {collection: 'HR', person: 'MA'};

  constructor(
    private translate: TranslateService,
    private labelService: TriplestoreLabelService,
    private userService: UserService,
    private collectionService: CollectionService,
    private formService: FormService,
    private exportService: ExportService
  ) {}

  public downloadDocuments(docs: Document[], year: number, type: string) {
    this.getBuffer(docs, type).subscribe((buffer) => {
      this.translate.get('haseka.submissions.submissions').subscribe((msg) => {
        const fileName = msg + '_' + year;
        this.exportService.exportArrayBuffer(buffer, fileName, type);
      });
    });
  }

  public downloadDocument(doc: Document, type: string) {
    this.getBuffer([doc], type).subscribe((buffer) => {
      this.translate.get('haseka.submissions.submission').subscribe((msg) => {
        const fileName = msg + '_' + doc.id.split('.')[1];
        this.exportService.exportArrayBuffer(buffer, fileName, type);
      });
    });
  }

  private getBuffer(docs: Document[], type: any): Observable<any> {
    return this.getJsonForms(docs)
      .pipe(
        switchMap(jsonForms => {
          return this.getAllFields(jsonForms)
            .pipe(
              switchMap(({fields: fields, fieldStructure: fieldStructure}) => {
                const dataObservables = [];
                docs.reduce((arr: Observable<any>[], doc: any) => {
                  if (!this.isEmpty('', doc, jsonForms[doc.formID])) {
                    arr.push(this.getData(Util.clone(doc), jsonForms[doc.formID], fieldStructure));
                  }
                  return arr;
                }, dataObservables);

                return (dataObservables.length > 0 ? ObservableForkJoin(dataObservables) : ObservableOf([]))
                  .pipe(
                    map(data => {
                      const mergedData = [].concat.apply([], data);

                      const aoa = this.convertDataToAoA(this.getUsedFields(fields), mergedData);
                      const sheet = XLSXUtils.aoa_to_sheet(aoa);

                      if (type === 'csv') {
                        return XLSXUtils.sheet_to_csv(sheet);
                      } else if (type === 'tsv') {
                        return XLSXUtils.sheet_to_csv(sheet, {FS: '\t'});
                      }

                      const book = XLSXUtils.book_new();
                      XLSXUtils.book_append_sheet(book, sheet);
                      return XLSXWrite(book, {bookType: type, type: 'array'});
                    })
                  );
              })
            );
        })
      );
  }

  private getJsonForms(docs: Document[], jsonForms = {}, idx = 0): Observable<any> {
    if (idx >= docs.length) {
      return ObservableOf(jsonForms);
    }

    const formId = docs[idx].formID;

    if (jsonForms[formId]) {
      return this.getJsonForms(docs, jsonForms, idx + 1);
    }

    return this.formService.getFormInJSONFormat(formId, this.translate.currentLang)
      .pipe(
        switchMap((jsonForm) => {
          jsonForms[formId] = jsonForm;
          return this.getJsonForms(docs, jsonForms, idx + 1);
        })
      );
  }

  private convertDataToAoA(fields: DocumentField[], data: any) {
    if (fields.length < 1) { return []; }

    const aoa = [[]];

    for (let i = 0; i < fields.length; i++) {
      aoa[0].push(fields[i].label);
    }

    for (let i = 0; i < data.length; i++) {
      const obj = data[i];
      aoa.push([]);

      for (let j = 0; j < fields.length; j++) {
        aoa[i + 1].push(
          fields[j].value.split('.').reduce((o, s) => {
            if (o) {
              return o[s];
            }
          }, obj)
        );
      }
    }

    return aoa;
  }

  private getData(obj: any, form: any, fieldData: DocumentFieldNode, path = ''): Observable<any> {
    const observables = [];
    let unwindKey: string;

    for (const key in obj) {
      if (!obj.hasOwnProperty(key) || key.charAt(0) === '@') {
        continue;
      }

      const child = obj[key];
      const fieldName = path + key;

      if (child == null || child === '' || (Array.isArray(child) && child.length < 1)) {
        continue;
      }

      if (this.unwindPaths.indexOf(fieldName) !== -1) {
        unwindKey = key;
        continue;
      }

      const field = this.getValueByPath(fieldName, fieldData);

      if (field) {
        if (field.value === fieldName) {
          field.used = true;

          observables.push(this.getLabelToValue(key, child, field)
            .pipe(
              tap((label) => {
                obj[key] = label;
              })
            )
          );
        } else {
          observables.push(this.getData(child, form, fieldData, fieldName + '.'));
        }
      }
    }

    return (observables.length > 0 ? ObservableForkJoin(observables) : ObservableOf([]))
      .pipe(
        switchMap(
          () => {
            if (unwindKey) {
              const getDataObservables = [];

              for (let i = 0; i < obj[unwindKey].length; i++) {
                if (!this.isEmpty(path + unwindKey, obj[unwindKey][i], form)) {
                  getDataObservables.push(this.getData(obj[unwindKey][i], form, fieldData, path + unwindKey + '.'));
                }
              }

              return (getDataObservables.length > 0 ? ObservableForkJoin(getDataObservables) : ObservableOf([]))
                .pipe(
                  map((arrays) => {
                    obj[unwindKey] = [].concat.apply([], arrays);
                    return this.unwind(unwindKey, obj);
                  })
                );
            } else {
              return ObservableOf([obj]);
            }
        })
      );
  }

  private unwind(key: string, obj: any): any {
    if (obj[key].length < 1) {
      return [obj];
    }

    return obj[key].map(child => {
      const res = {};

      for (const j in obj) {
        if (obj.hasOwnProperty(j) && j !== key) {
          res[j] = obj[j];
        }
      }
      res[key] = child;

      return res;
    });
  }

  private getUsedFields(fields: DocumentField[]): DocumentField[] {
    return fields.reduce((arr, field) => {
      if (field.used) {
        arr.push(field);
      }
      return arr;
    }, []);
  }

  private getAllFields(jsonForms: any): Observable<{fields: DocumentField[], fieldStructure: DocumentFieldNode}> {
    const fieldStructure: DocumentFieldNode = {};
    const fields: DocumentField[] = [];

    const labelObservables = this.extraFields.map(value => {
      return this.getFieldLabel(value)
        .pipe(
          tap(label => {
            const field: DocumentField = {value: value, label: label, used: false};
            fieldStructure[value] = field;
            fields.push(field);
          })
        );
      });

    return ObservableForkJoin(labelObservables)
      .pipe(
        map(() => {
          let queue = [];

          for (const formId in jsonForms) {
            if (!jsonForms.hasOwnProperty(formId)) {
              continue;
            }
            const form = jsonForms[formId];
            for (let i = 0; i < form.fields.length; i++) {
              queue.push({...form.fields[i], path: ''});
            }
          }
          queue = this.sortQueue(queue);

          while (queue.length > 0) {
            let next = queue.shift();
            const fieldName = next.path + next.name;
            const parent = this.getValueByPath(next.path, fieldStructure);

            if (this.unwindPaths.indexOf(fieldName) === -1 && next.type !== 'fieldset') {
              if (!parent[next.name]) {
                const field: DocumentField = {
                  value: fieldName,
                  label: next.label,
                  used: false
                };
                if (next.options && next.options.value_options) {
                  field.enums = next.options.value_options;
                }
                parent[next.name] = field;
                fields.push(field);
              }
            } else {
              parent[next.name] = {};
              while (true) {
                for (let i = 0; i < next.fields.length; i++) {
                  queue.push({...next.fields[i], path: fieldName + '.'})
                }

                if (queue.length < 1) {
                  break;
                }

                const upNext = queue[0];
                if (upNext.name === next.name) {
                  next = queue.shift();
                } else {
                  break;
                }
              }
              queue = this.sortQueue(queue);
            }
          }

          return {fields: fields, fieldStructure: fieldStructure};
        })
      );
  }

  private sortQueue(queue: any[]) {
    return queue.sort((a, b) => {
      if (this.unwindPaths.indexOf(a.path + a.name) !== -1) {
        return 1;
      }
      if (this.unwindPaths.indexOf(b.path + b.name) !== -1) {
        return -1;
      }
      if (a.type === 'fieldset') {
        return 1;
      }
      if (b.type === 'fieldset') {
        return -1;
      }
      return 0;
    });
  }

  private getLabelToValue(key: string, obj: any, fieldData: any): Observable<any> {
    let value = '';

    if (key === 'geometry') {
      value += geoJSONToISO6709({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: obj,
        }]}).replace(/\n$/, '');
    } else if (Array.isArray(obj)) {
      return ObservableForkJoin(obj.map((labelKey) => {
        return this.getDataLabel(labelKey, fieldData);
      }))
        .pipe(map(array => array.join(', ')));
    } else {
      return this.getDataLabel(obj, fieldData);
    }

    return ObservableOf(value);
  }

  private getDataLabel(key: string, fieldData: any): Observable<string> {
    if (typeof key !== 'string') {
      return ObservableOf(JSON.stringify(key));
    }

    if (fieldData && fieldData.enums && fieldData.enums[key]) {
      return ObservableOf(fieldData.enums[key]);
    }

    if (key.match(new RegExp('^' + this.valuePrefixes.person + '\.[0-9]+$'))) {
      return this.userService
        .getUser(key)
        .pipe(
          map((user) => {
            return user.fullName || key;
          })
        );
    }

    if (key.match(new RegExp('^' + this.valuePrefixes.collection + '\.[0-9]+$'))) {
      return this.collectionService
        .getName(key, this.translate.currentLang)
        .pipe(
          map((name: any[]) => {
            return name.length > 0 && name[0].value ? name[0].value : key;
          })
        );
    }

    return ObservableOf(key);
  }

  private getFieldLabel(fieldName: string): Observable<string> {
    if (this.classPrefixes[fieldName]) {
      return this.labelService
        .get(this.classPrefixes[fieldName] + '.' + fieldName, this.translate.currentLang)
        .pipe(
          map((label) => {
            return label || fieldName;
          })
        );
    }

    return ObservableOf(fieldName.charAt(0).toUpperCase() + fieldName.slice(1))
  }

  private isEmpty(path: string, obj: any, form: any): boolean {
    if (path === '') {
      if (!obj.gatherings || obj.gatherings.length < 1) { return true; }

      for (let i = 0; i < obj.gatherings.length; i++) {
        if (!this.isEmpty('gatherings', obj.gatherings[i], form)) { return false; }
      }

      return true;
    } else if (path === 'gatherings') {
      if (!obj.units || obj.units.length < 1) { return true; }

      for (let i = 0; i < obj.units.length; i++) {
        if (!this.isEmpty('gatherings.units', obj.units[i], form)) { return false; }
      }

      return true;
    } else if (path === 'gatherings.units') {
      return DocumentInfoService.isEmptyUnit(obj, form);
    }

    return false;
  }

  private getValueByPath(path: string, data: any): any {
    return path.split('.').reduce((o, s) => {
      if (s === '') {
        return o;
      }
      if (o) {
        return o[s];
      }
    }, data);
  }
}
