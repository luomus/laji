import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { LocalStorage } from 'ng2-webstorage';
import { UserService } from './user.service';
import { Util } from './util.service';
import { FormApi } from '../api/FormApi';
import { DocumentApi } from '../api/DocumentApi';
import { Document } from '../model/Document';
import { AppConfig } from '../../app.config';
import { environment } from '../../../environments/environment';
import * as deepmerge from 'deepmerge';


@Injectable()
export class FormService {

  public localChanged = new EventEmitter();

  @LocalStorage() private formDataStorage;
  @LocalStorage() private tmpDocId;
  private tmpNs = 'T';
  private currentData: any;
  private currentKey: string;
  private currentLang: string;
  private formCache: {[key: string]: any} = {};
  private formPending: {[key: string]: Observable<any>} = {};
  private allForms: any[];

  private _populate: any;

  constructor(
    private formApi: FormApi,
    private userService: UserService,
    private documentApi: DocumentApi,
    private appConfig: AppConfig
  ) {
    if (!this.formDataStorage) {
      this.formDataStorage = {};
    }
    if (!this.tmpDocId) {
      this.tmpDocId = 0;
    }
  }

  getUserId(): Observable<string> {
    return this.userService.getUser()
      .map(person => person.id);
  }

  discard(id?: string): void {
    if (!id) {
      id = this.currentKey;
    }
    this.getUserId()
      .switchMap(userID => {
        if (this.formDataStorage[userID] && this.formDataStorage[userID][id]) {
          delete this.formDataStorage[userID][id];
          this.formDataStorage = {...this.formDataStorage};
          this.localChanged.emit(true);
        }
        return Observable.of(true);
      })
      .subscribe();
  }

  store(formData: Document): Observable<string> {
    if (this.currentKey) {
      return this.getUserId()
        .switchMap(userID => {
          if (!this.formDataStorage[userID]) {
            this.formDataStorage[userID] = {};
          }
          this.formDataStorage[userID][this.currentKey] = { 'formData': formData, 'dateStored': new Date() };
          this.formDataStorage = {...this.formDataStorage};
          return Observable.of(this.currentKey);
        });
    }
    return Observable.of('');
  }

  hasUnsavedData(id?: string, document?: Document): Observable<boolean> {
    if (!id) {
      id = this.currentKey;
    }
    return this.getUserId()
      .switchMap(userID => {
        const tmpDoc = this.getTmpDoc(userID, id);
        if (this.isTmpId(id)) {
          return Observable.of(tmpDoc._hasChanges);
        }

        if (document && tmpDoc) {
          return Observable.of(
            this.isLocalNewest(tmpDoc, document)
          );
        }
        return Observable.of(!!tmpDoc);
      });
  }

  getDataWithoutChanges() {
    return this.currentData;
  }

  setCurrentData(data: any, storeIdAsCurrentKey = false) {
    if (storeIdAsCurrentKey) {
      if (data.id) {
        this.currentKey = data.id;
      }
    }
    this.currentData = Util.clone(data);
  }

  generateTmpId() {
    if (this.tmpDocId >= (Number.MAX_SAFE_INTEGER - 1009) ) {
      this.tmpDocId = 0;
    }
    this.tmpDocId = this.tmpDocId + 1;
    return this.getTmpId(this.tmpDocId);
  }

  isTmpId(id: string) {
    return id && id.indexOf(this.tmpNs + ':') === 0;
  }

  getAllTempDocuments(): Observable<Document[]> {
    return this.getUserId()
      .switchMap(userID => {
        if (!this.formDataStorage[userID]) {
          return Observable.of([]);
        }
        return Observable.of(
          Object.keys(this.formDataStorage[userID])
            .filter((key) => this.isTmpId(key))
            .map((key) => {
              const document = this.getTmpDoc(userID, key);
              document.id = key;
              return document;
            })
            .reverse()
        );
      });
  }

  getForm(formId: string, lang: string): Observable<any> {
    if (!formId) {
      return Observable.of({});
    }
    this.setLang(lang);
    if (this.formCache[formId]) {
      return Observable.of(this.formCache[formId]);
    } else if (!this.formPending[formId]) {
      this.formPending[formId] = this.formApi.formFindById(formId, lang)
        .do((schema) => {
          this.formCache[formId] = schema;
        })
        .share();
    }
    return this.formPending[formId];
  }

  load(formId: string, lang: string, documentId?: string): Observable<any> {
    this.setLang(lang);
    const form$ = this.formCache[formId] ?
      Observable.of(this.formCache[formId]) :
      this.formApi.formFindById(formId, lang)
        .do((schema) => {
          this.formCache[formId] = schema;
        });
    const data$ = documentId ?
      this.getUserId().switchMap(userID => {
        const tmpDoc = this.getTmpDoc(userID, documentId);
        return this.isTmpId(documentId) && tmpDoc ?
          Observable.of(tmpDoc) :
          this.documentApi.findById(documentId, this.userService.getToken());
      }) :
      this.userService.getDefaultFormData();

    return data$
      .do(data => this.setCurrentData(data))
      .switchMap(data => {
        return form$
          .combineLatest(
            this.getDefaultData(formId, documentId, data),
            (form, current) => {
              form.formData = current;
              if (!documentId && form.prepopulatedDocument) {
                form.formData = deepmerge(form.formData || {}, form.prepopulatedDocument || {});
              }
              this.currentData = Util.clone(form.formData);
              return form;
            }
          );
      });
  }

  getDefaultData(formId: string, documentId?: string, current?: any): Observable<any> {
    if (!documentId) {
      return this.defaultFormData(formId);
    }
    return this.localFormDataIfNoNewerInRemote(documentId, current);
  }

  getAllForms(lang: string): Observable<any> {
    this.setLang(lang);
    return this.allForms ?
      Observable.of(this.allForms) :
      this.formApi.formFindAll(this.currentLang)
        .map((forms) => forms.results.filter(form => this.appConfig.isFormAllowed(form.id)))
        .do((forms) => this.allForms = forms);
  }

  populate(data: any) {
    this._populate = deepmerge(this._populate || {}, data || {});
  }

  getEditUrlPath(formId, documentId) {
    if (formId === environment.nafiForm) {
      return '/theme/nafi/form/' + documentId;
    }
    if (!formId) {
      formId = environment.defaultForm;
    }
    return '/vihko/' + formId + '/' + documentId;
  }


  getTmpDocumentStoreDate(id: string): Observable<Date> {
    return this.getUserId()
      .switchMap(userID => {
        if (this.formDataStorage[userID] && this.formDataStorage[userID][id] && this.formDataStorage[userID][id].dateStored) {
          return Observable.of(this.formDataStorage[userID][id].dateStored);
        }
        return Observable.of(null);
      });
  }

  getTmpDocumentIfNewerThanCurrent(current: Document, documentId?: string): Observable<Document> {
    if (!documentId) { documentId = current.id; }

    return this.getUserId()
      .switchMap(userID => {
        const tmpDoc = this.getTmpDoc(userID, documentId);

        if (!tmpDoc) {
          return Observable.of(current);
        }

        if (this.isLocalNewest(tmpDoc, current)) {
          return Observable.of(tmpDoc);
        }
        delete this.formDataStorage[userID][documentId];
        this.formDataStorage = Util.clone(this.formDataStorage);
        return Observable.of(current);
      });
  }

  private getTmpDoc(userID: string, id: string): Document {
    if (this.formDataStorage[userID] && this.formDataStorage[userID][id]) {
      if (this.formDataStorage[userID][id].formData) {
        return this.formDataStorage[userID][id].formData;
      } else {
        return this.formDataStorage[userID][id];
      }
    }
    return null;
  }

  private getTmpId(num: number) {
    return this.tmpNs + ':' + num;
  }

  private setLang(lang: string) {
    if (this.currentLang !== lang) {
      this.formCache = {};
      this.formPending = {};
      this.allForms = undefined;
      this.currentLang = lang;
    }
  }

  private localFormDataIfNoNewerInRemote(documentId: string, current?: any): Observable<Document> {
    if (!current) {
      throw new Error('No current form data given!');
    }
    this.currentKey = documentId;
    this.setCurrentData(current);

    return this.getTmpDocumentIfNewerThanCurrent(current, documentId);
  }

  private defaultFormData(formId: string) {
    this.currentKey = this.generateTmpId();
    return this.userService.getDefaultFormData()
      .map((data: Document) => {
        return deepmerge(deepmerge( data || {}, {formID: formId}), this._populate || {});
      })
      .do(() => {
        delete this._populate;
      });
  }

  private isLocalNewest(local, remote): boolean {
    if (remote.dateEdited) {
      if (!local.dateEdited ||
        this.getDateFromString(local.dateEdited) < this.getDateFromString(remote.dateEdited)) {
        return false;
      }
    }
    return true;
  }

  private getDateFromString(dateString) {
    const reggie = /(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})/;
    const dateArray = reggie.exec(dateString);
    return new Date(
      (+dateArray[1]),
      (+dateArray[2]) - 1, // Careful, month starts at 0!
      (+dateArray[3]),
      (+dateArray[4]),
      (+dateArray[5]),
      (+dateArray[6])
    );
  }
}
