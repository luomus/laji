import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { LocalStorage } from 'ng2-webstorage';
import { UserService } from '../../shared/service/user.service';
import { Util } from '../../shared/service/util.service';
import { FormApi } from '../../shared/api/FormApi';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { Document } from '../../shared/model/Document';
import { AppConfig } from '../../app.config';


@Injectable()
export class FormService {

  @LocalStorage() private formDataStorage;
  @LocalStorage() private tmpDocId;
  private tmpNs = 'T';
  private currentData: any;
  private currentKey: string;
  private currentLang: string;
  private formCache: {[key: string]: any} = {};
  private allForms: any[];
  private successMsg;
  private subUpdate: Subscription;
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
          this.formDataStorage = Util.clone(this.formDataStorage);
        }
        return Observable.of(true);
      })
      .subscribe();
  }

  setSuccessMessage(msg: string) {
    this.successMsg = msg;
  }

  getSuccessMessage() {
    let message = '';
    if (this.successMsg) {
      message = this.successMsg;
      this.successMsg = '';
    }
    return message;
  }

  store(formData) {
    if (this.currentKey) {
      return this.getUserId()
        .switchMap(userID => {
          if (!this.formDataStorage[userID]) {
            this.formDataStorage[userID] = {};
          }
          this.formDataStorage[userID][this.currentKey] = formData;
          this.formDataStorage = Util.clone(this.formDataStorage);
          return Observable.of(this.currentKey);
        });
    }
    return Observable.of('');
  }

  hasUnsavedData(id?: string, document?: any): Observable<boolean> {
    if (!id) {
      id = this.currentKey;
    }
    if (this.isTmpId(id)) {
      return Observable.of(true);
    }
    return this.getUserId()
      .switchMap(userID => {
        const result = typeof this.formDataStorage[userID] !== 'undefined' &&
          typeof this.formDataStorage[userID][id] !== 'undefined';
        if (document && result) {
          return Observable.of(
            this.isLocalNewest(this.formDataStorage[userID][id], document)
          );
        }
        return Observable.of(result);
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
              const document = this.formDataStorage[userID][key];
              document.id = key;
              return document;
            })
            .reverse()
        );
      });
  }

  getForm(formId: string, lang: string): Observable<any> {
    this.setLang(lang);
    return this.formCache[formId] ?
      Observable.of(this.formCache[formId]) :
      this.formApi.formFindById(formId, lang)
        .do((schema) => {
          this.formCache[formId] = schema;
        });
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
          return this.isTmpId(documentId) && this.formDataStorage[userID][documentId] ?
            Observable.of(this.formDataStorage[userID][documentId]) :
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
    this._populate = Object.assign({}, this._populate, data);
  }

  private getTmpId(num: number) {
    return this.tmpNs + ':' + num;
  }

  private setLang(lang: string) {
    if (this.currentLang !== lang) {
      this.formCache = {};
      this.allForms = undefined;
      this.currentLang = lang;
    }
  }

  private localFormDataIfNoNewerInRemote(documentId: string, current?: any) {
    if (!current) {
      throw new Error('No current form data given!');
    }
    this.currentKey = documentId;
    this.setCurrentData(current);
    return this.getUserId()
      .switchMap(userID => {
        if (!this.formDataStorage[userID] || !this.formDataStorage[userID][documentId]) {
          return Observable.of(current);
        }
        if (this.isLocalNewest(this.formDataStorage[userID][documentId], current)) {
          return Observable.of(this.formDataStorage[userID][documentId]);
        }
        delete this.formDataStorage[userID][documentId];
        this.formDataStorage = Util.clone(this.formDataStorage);
        return Observable.of(current);
      });
  }

  private defaultFormData(formId: string) {
    this.currentKey = this.generateTmpId();
    return this.userService.getDefaultFormData()
      .map((data: Document) => {
        return Object.assign({}, data, {formID: formId}, this._populate);
      })
      .do((data) => {
        this.currentData = Util.clone(data);
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
