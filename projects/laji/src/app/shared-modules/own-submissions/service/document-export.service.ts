import { Injectable } from '@angular/core';
import { Document } from '../../../shared/model/Document';
import { Util } from '../../../shared/service/util.service';
import { TriplestoreLabelService } from '../../../shared/service/triplestore-label.service';
import { UserService } from '../../../shared/service/user.service';
import { CollectionService } from '../../../shared/service/collection.service';
import { FormService } from '../../../shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { geoJSONToISO6709 } from '@luomus/laji-map/lib/utils';
import { BookType } from 'xlsx';
import { forkJoin as ObservableForkJoin, Observable, of as ObservableOf } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { DocumentInfoService } from '../../../shared/service/document-info.service';
import { ExportService } from '../../../shared/service/export.service';
import { DocumentField } from '../models/document-field';
import { FeatureCollection } from 'geojson';
import { Form } from '../../../shared/model/Form';


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

  public downloadDocuments(docs$: Observable<Document[]>, year: number, type: string) {
    docs$.pipe(
      switchMap(docs => this._downloadDocuments(docs, type, this.translate.instant('haseka.submissions.submissions') + '_' + year))
    ).subscribe(() => {});
  }

  public downloadDocument(doc$: Observable<Document & { id: string }>, type: string) {
    doc$.pipe(
      switchMap(doc =>
        this._downloadDocuments([doc], type, this.translate.instant('haseka.submissions.submission') + '_' + doc.id.split('.')[1])
      )
    ).subscribe(() => {});
  }

  private _downloadDocuments(docs: Document[], type: string, filename: string): Observable<void> {
    return this.getAoa(docs).pipe(
      switchMap(aoa => this.exportService.export(aoa, type as BookType, filename))
    );
  }

  private getAoa(docs: Document[]): Observable<any> {
    return this.getJsonForms(docs)
      .pipe(
        switchMap(jsonForms => this.getAllFields(jsonForms)
            .pipe(
              switchMap(({fields, fieldStructure}) => {
                const dataObservables: any[] = [];
                docs.reduce((arr: Observable<any>[], doc: any) => {
                  if (!this.isEmpty('', doc, jsonForms[doc.formID])) {
                    arr.push(this.getData(Util.clone(doc), jsonForms[doc.formID], fieldStructure));
                  }
                  return arr;
                }, dataObservables);

                return (dataObservables.length > 0 ? ObservableForkJoin(dataObservables) : ObservableOf([]))
                  .pipe(
                    map((data: any[]) => {
                      const mergedData = [].concat.apply([], data);

                      return this.convertDataToAoA(this.getUsedFields(fields), mergedData);
                    })
                  );
              })
            ))
      );
  }

  private getJsonForms(docs: Document[], jsonForms: Record<string, Form.JsonForm>= {}, idx = 0): Observable<{[formID: string]: Form.JsonForm}> {
    if (idx >= docs.length) {
      return ObservableOf(jsonForms);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const formId = docs[idx].formID!;

    if (jsonForms[formId]) {
      return this.getJsonForms(docs, jsonForms, idx + 1);
    }

    return this.formService.getFormInJSONFormat(formId)
      .pipe(
        switchMap((jsonForm) => {
          jsonForms[formId] = jsonForm;
          return this.getJsonForms(docs, jsonForms, idx + 1);
        })
      );
  }

  private convertDataToAoA(fields: DocumentField[], data: any) {
    if (fields.length < 1) { return []; }

    const aoa: any[][] = [[]];

    for (const field of fields) {
      aoa[0].push(field['label']);
    }

    for (let i = 0; i < data.length; i++) {
      const obj = data[i];
      aoa.push([]);

      for (const field of fields) {
        aoa[i + 1].push(Util.parseJSONPath(obj, field['value'] as string));
      }
    }

    return aoa;
  }

  private getData(obj: any, form: Form.JsonForm, fieldData: DocumentField, path = ''): Observable<any> {
    const observables: Observable<never>[] = [];
    let unwindKey: string;

    if (Array.isArray(obj)) {
      for (const item of obj) {
        this.processData(item, form, fieldData, path, observables);
      }
      if (obj.length > (fieldData as any)['@multipleBy']) {
        (fieldData as any)['@multipleBy'] = obj.length;
      }
    } else {
      unwindKey = this.processData(obj, form, fieldData, path, observables);
    }

    return (observables.length > 0 ? ObservableForkJoin(observables) : ObservableOf([]))
      .pipe(
        switchMap(
          () => {
            if (unwindKey) {
              const getDataObservables = [];

              for (const item of obj[unwindKey]) {
                if (!this.isEmpty(path + unwindKey, item, form)) {
                  getDataObservables.push(
                    this.getData(item, form, (fieldData as any)[unwindKey], path + unwindKey + '.')
                  );
                }
              }

              return (getDataObservables.length > 0 ? ObservableForkJoin(getDataObservables) : ObservableOf([]))
                .pipe(
                  map((arrays: any[]) => {
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

  private processData(obj: any, form: Form.JsonForm, fieldData: DocumentField, path: string, observables: Observable<any>[]) {
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

      const field = (fieldData as any)[key];

      if (field) {
        if (field['value'] === fieldName) {
          field['used'] = true;

          observables.push(this.getLabelToValue(key, child, field)
            .pipe(
              tap((label) => {
                obj[key] = label;
              })
            )
          );
        } else {
          observables.push(this.getData(child, form, field, fieldName + '.'));
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return unwindKey!;
  }

  private unwind(key: string, obj: any): any {
    if (obj[key].length < 1) {
      return [obj];
    }

    return obj[key].map((child: any) => {
      const res: Record<string, any> = {};

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
    const result: DocumentField[] = [];

    fields.reduce((arr: DocumentField[], field: DocumentField) => {
      if ((field as any)['@multipleBy']) {
        for (let i = 0; i < (field as any)['@multipleBy']; i++) {
          for (const key in field) {
            if (field.hasOwnProperty(key) && (field as any)[key]['used']) {
              const lastIdx = (field as any)[key].value.lastIndexOf('.');
              arr.push({
                value: (field as any)[key].value.substring(0, lastIdx + 1) + i + (field as any)[key].value.substring(lastIdx),
                label: (field as any)['@multipleBy'] > 1 ? (field as any)[key].label + ' (' + (i + 1) + ')' : (field as any)[key].label,
                used: true
              });
            }
          }
        }
      } else if (field['used']) {
        arr.push(field);
      }
      return arr;
    }, result);

    return result;
  }

  private getAllFields(jsonForms: {[formID: string]: Form.JsonForm}): Observable<{fields: DocumentField[]; fieldStructure: DocumentField}> {
    const fieldStructure: DocumentField = {};
    const fields: DocumentField[] = [];

    const labelObservables = this.extraFields.map(value => this.getFieldLabel(value)
        .pipe(
          tap(label => {
            const field: DocumentField = {value, label, used: false};
            fieldStructure[value] = field;
            fields.push(field);
          })
        ));

    return ObservableForkJoin(labelObservables)
      .pipe(
        map(() => {
          let queue = [];

          for (const formId in jsonForms) {
            if (!jsonForms.hasOwnProperty(formId)) {
              continue;
            }
            const form = jsonForms[formId];
            for (const field of form.fields) {
              queue.push({...field, path: ''});
            }
          }
          queue = this.sortQueue(queue);

          while (queue.length > 0) {
            let next = queue.shift();
            const fieldName = next.path + next.name;
            const parent = Util.parseJSONPath(fieldStructure, next.path);

            if (!next.fields) {
              if (!parent[next.name]) {
                const field: DocumentField = {
                  value: fieldName,
                  label: next.label,
                  used: false
                };
                if (next.options && next.options.value_options) {
                  field['enums'] = next.options.value_options;
                }
                parent[next.name] = field;
                if (!parent['@multipleBy']) {
                  fields.push(field);
                }
              }
            } else {
              const field: DocumentField = {};
              if (next.type === 'collection' && this.unwindPaths.indexOf(fieldName) === -1) {
                field['@multipleBy'] = 1;
                fields.push(field);
              }
              parent[next.name] = field;

              while (true) {
                for (const _field of next.fields) {
                  queue.push({..._field, path: fieldName + '.'});
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

          return {fields, fieldStructure};
        })
      );
  }

  private sortQueue(queue: any[]) {
    return queue.sort((a, b) => this.getSortIdx(a) - this.getSortIdx(b));
  }

  private getSortIdx(queueItem: any) {
    if (this.unwindPaths.indexOf(queueItem.path + queueItem.name) !== -1) {
      return 3;
    } else if (queueItem.fields && queueItem.type === 'collection') {
      return 2;
    } else if (queueItem.type === 'fieldSet') {
      return 1;
    }
    return 0;
  }

  private getLabelToValue(key: string, obj: any, fieldData: any): Observable<any> {
    let value: string;

    if (key === 'geometry') {
      value = geoJSONToISO6709({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: obj,
        }]} as FeatureCollection).replace(/\n$/, '');
    } else if (Array.isArray(obj)) {
      return ObservableForkJoin(obj.map((labelKey) => this.getDataLabel(labelKey, fieldData)))
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
      return this.userService.getPersonInfo(key);
    }

    if (key.match(new RegExp('^' + this.valuePrefixes.collection + '\.[0-9]+$'))) {
      return this.collectionService
        .getName$(key, this.translate.currentLang);
    }

    return ObservableOf(key);
  }

  private getFieldLabel(fieldName: string): Observable<string> {
    if ((this.classPrefixes as any)[fieldName]) {
      return this.labelService
        .get((this.classPrefixes as any)[fieldName] + '.' + fieldName, this.translate.currentLang)
        .pipe(
          map((label) => label || fieldName)
        );
    }

    return ObservableOf(fieldName.charAt(0).toUpperCase() + fieldName.slice(1));
  }

  private isEmpty(path: string, obj: any, form: Form.JsonForm): boolean {
    if (path === '') {
      if (!obj.gatherings || obj.gatherings.length < 1) { return true; }

      for (const gathering of obj.gatherings) {
        if (!this.isEmpty('gatherings', gathering, form)) { return false; }
      }

      return true;
    } else if (path === 'gatherings') {
      if (!obj.units || obj.units.length < 1) { return true; }

      for (const unit of obj.units) {
        if (!this.isEmpty('gatherings.units', unit, form)) { return false; }
      }

      return true;
    } else if (path === 'gatherings.units') {
      return DocumentInfoService.isEmptyUnit(obj, form);
    }

    return false;
  }
}
