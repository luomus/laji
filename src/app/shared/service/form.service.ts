import { EventEmitter, Injectable } from '@angular/core';
import { Observable ,  Observer, of as ObservableOf } from 'rxjs';
import { LocalStorage } from 'ng2-webstorage';
import { UserService } from './user.service';
import { Util } from './util.service';
import { DocumentApi } from '../api/DocumentApi';
import { Document } from '../model/Document';
import { environment } from '../../../environments/environment';
import * as deepmerge from 'deepmerge';
import { DocumentService } from '../../shared-modules/own-submissions/service/document.service';
import { LajiApi, LajiApiService } from './laji-api.service';
import { map, switchMap, tap } from 'rxjs/operators';
import { FormList } from '../../+haseka/form-list/haseka-form-list';


export interface LoadResponse extends FormList {
  formData: Document;
  currentId: string;
}

@Injectable({providedIn: 'root'})
export class FormService {

  readonly forms = {
    [environment.nafiForm]: '/theme/nafi/form',
    [environment.wbcForm]: '/theme/talvilintulaskenta/form',
    [environment.lineTransectForm]: '/theme/linjalaskenta/form',
    [environment.lineTransectEiVakioForm]: '/theme/linjalaskenta/ei-vakiolinjat',
    [environment.lineTransectKartoitusForm]: '/theme/linjalaskenta/kartoitus',
    default: '/vihko'
  };

  localChanged = new EventEmitter();

  @LocalStorage() private formDataStorage;
  @LocalStorage() private tmpDocId;
  private tmpNs = 'T';
  private currentData: any;
  private currentKey: string;
  private currentLang: string;
  private formCache: {[key: string]: any} = {};
  private jsonFormCache: {[key: string]: any} = {};
  private formPending: {[key: string]: Observable<any>} = {};
  private allForms: any[];

  private _populate: any;

  constructor(
    private lajiApi: LajiApiService,
    private userService: UserService,
    private documentApi: DocumentApi,
    private documentService: DocumentService
  ) {
    if (!this.formDataStorage) {
      this.formDataStorage = {};
    }
    if (!this.tmpDocId) {
      this.tmpDocId = 0;
    }
  }

  hasNamedPlace(): boolean {
    return !!(this._populate && this._populate.namedPlaceID) || !!(this.currentData && this.currentData.namedPlaceID);
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
          if (!this.formDataStorage[userID][id].formData || !this.formDataStorage[userID][id].formData._isTemplate) {
            delete this.formDataStorage[userID][id];
            this.formDataStorage = {...this.formDataStorage};
            this.localChanged.emit(true);
          }
        }
        return ObservableOf(true);
      })
      .subscribe();
  }

  store(document: Document): Observable<string> {
    if (this.currentKey) {
      return this.getUserId()
        .switchMap(userID => {
          if (!this.formDataStorage[userID]) {
            this.formDataStorage[userID] = {};
          }
          this.formDataStorage[userID][this.currentKey] = { 'formData': document, 'dateStored': new Date() };
          this.formDataStorage = {...this.formDataStorage};
          return ObservableOf(this.currentKey);
        });
    }
    return ObservableOf('');
  }

  hasUnsavedData(id?: string, document?: Document): Observable<boolean> {
    if (!id) {
      id = this.currentKey;
    }
    return this.getUserId()
      .switchMap(userID => {
        const tmpDoc = this.getTmpDoc(userID, id);
        if (this.isTmpId(id)) {
          return ObservableOf(tmpDoc._hasChanges);
        }

        if (document && tmpDoc) {
          return ObservableOf(
            this.isLocalNewest(tmpDoc, document)
          );
        }
        return ObservableOf(!!tmpDoc);
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
          return ObservableOf([]);
        }
        return ObservableOf(
          Object.keys(this.formDataStorage[userID])
            .filter((key) => this.isTmpId(key))
            .reduce((array, key) => {
              const document = this.getTmpDoc(userID, key);
              if (!document._hasChanges) {
                delete this.formDataStorage[userID][key];
              } else {
                document.id = key;
                array.push(document);
              }
              return array;
            }, [])
            .reverse()
        );
      });
  }

  getForm(formId: string, lang: string): Observable<any> {
    if (!formId) {
      return ObservableOf({});
    }
    this.setLang(lang);
    if (this.formCache[formId]) {
      return ObservableOf(this.formCache[formId]);
    } else if (!this.formPending[formId]) {
      this.formPending[formId] = this.lajiApi.get(LajiApi.Endpoints.forms, formId, {lang})
        .do((schema) => this.formCache[formId] = schema)
        .share();
    }
    return Observable.create((observer: Observer<string>) => {
      this.formPending[formId].subscribe(data => {
        observer.next(data);
        observer.complete();
      });
    } );
  }

  getFormInJSONFormat(formId: string, lang: string): Observable<any> {
    if (!formId) {
      return ObservableOf({});
    }
    this.setLang(lang);
    if (this.jsonFormCache[formId]) {
      return ObservableOf(this.jsonFormCache[formId]);
    } else {
      return this.lajiApi.get(LajiApi.Endpoints.forms, formId, {lang, format: 'json'})
        .do((jsonForm) => this.formCache[formId] = jsonForm);
    }
  }

  /**
   * Loads the form and populates the default data of the Document
   *
   * @param {string} formId
   * @param {string} lang
   * @param {string} documentId
   * @returns {Observable<any>}
   */
  load(formId: string, lang: string, documentId?: string): Observable<LoadResponse> {
    this.setLang(lang);
    const form$ = this.formCache[formId] ?
      ObservableOf(this.formCache[formId]) :
      this.lajiApi.get(LajiApi.Endpoints.forms, formId, {lang})
        .do((schema) => {
          this.formCache[formId] = schema;
        });
    const data$ = documentId ?
      this.getUserId().switchMap(userID => {
        const tmpDoc = this.getTmpDoc(userID, documentId);
        return this.isTmpId(documentId) && tmpDoc ?
          ObservableOf(tmpDoc) :
          this.documentApi.findById(documentId, this.userService.getToken())
            .switchMap((document: Document) => {
              if (!document.isTemplate) {
                return ObservableOf(document)
                  .do(data => this.setCurrentData(data));
              }
              documentId = '';
              const newDocument = this.documentService.removeMeta(document, ['isTemplate', 'templateName', 'templateDescription']);
              newDocument._isTemplate = true;
              this.populate(newDocument);
              return ObservableOf(newDocument);
            });
      }) :
      this.userService.getDefaultFormData()
        .do(data => this.setCurrentData(data));

    return data$
      .switchMap(data => {
        return form$
          .combineLatest(
            this.getDefaultData(formId, documentId, data),
            (form, current) => {
              form.formData = current;
              form.currentId = this.currentKey;
              if (!documentId && form.prepopulatedDocument) {
                form.formData = deepmerge(form.formData || {}, form.prepopulatedDocument);
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
      ObservableOf(this.allForms) :
      this.lajiApi.getList(LajiApi.Endpoints.forms, {lang: this.currentLang}).pipe(
        map((forms) => forms.results.filter(form => this.isFormAllowed(form.id))),
        tap(forms => this.allForms = forms)
      );
  }

  populate(data: any) {
    this._populate = deepmerge(this._populate || {}, data || {});
  }

  getAddUrlPath(formId) {
    if (!formId) {
      formId = environment.defaultForm;
    }
    if (this.forms[formId]) {
      return `${this.forms[formId]}`;
    }
    return  `${this.forms.default}/${formId}`;
  }

  getEditUrlPath(formId, documentId) {
    return `${this.getAddUrlPath(formId)}/${documentId}`;
  }


  getTmpDocumentStoreDate(id: string): Observable<Date> {
    return this.getUserId().pipe(
      switchMap(userID => {
        if (this.formDataStorage[userID] && this.formDataStorage[userID][id] && this.formDataStorage[userID][id].dateStored) {
          return ObservableOf(this.formDataStorage[userID][id].dateStored);
        }
        return ObservableOf(null);
      })
    );
  }

  getTmpDocumentIfNewerThanCurrent(current: Document, documentId?: string): Observable<Document> {
    if (!documentId) { documentId = current.id; }

    return this.getUserId().pipe(
      switchMap(userID => {
        const tmpDoc = this.getTmpDoc(userID, documentId);

        if (!tmpDoc) {
          return ObservableOf(current);
        }

        if (this.isLocalNewest(tmpDoc, current)) {
          return ObservableOf(tmpDoc);
        }
        delete this.formDataStorage[userID][documentId];
        this.formDataStorage = Util.clone(this.formDataStorage);
        return ObservableOf(current);
      })
    );
  }

  private isFormAllowed(formId: string) {
    const forms = environment.formWhitelist;
    if (forms.length === 0) {
      return true;
    }
    return forms.indexOf(formId) !== -1;
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

  /**
   * Fetch current document and merges populate values into it
   * After merge deletes the populate data
   *
   * @param {string} formId
   * @returns {Observable<Document>}
   */
  private defaultFormData(formId: string): Observable<Document> {
    this.currentKey = this.generateTmpId();
    return this.userService.getDefaultFormData().pipe(
      map((data: Document) => ({...(data || {}), formID: formId})),
      map((data: Document) => this._populate ? deepmerge(data, this._populate) : data),
      tap(() => delete this._populate)
    );
  }

  /**
   * Return true if local dataEdited is newer than the remote dateEdited
   * @param local
   * @param remote
   * @returns {boolean}
   */
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
