import { EventEmitter, Injectable } from '@angular/core';
import { Observable, Observer, of as ObservableOf, throwError as observableThrowError } from 'rxjs';
import { LocalStorage } from 'ngx-webstorage';
import { UserService } from './user.service';
import { Util } from './util.service';
import { DocumentApi } from '../api/DocumentApi';
import { Document } from '../model/Document';
import { environment } from '../../../environments/environment';
import merge from 'deepmerge';
import { DocumentService } from '../../shared-modules/own-submissions/service/document.service';
import { LajiApi, LajiApiService } from './laji-api.service';
import { combineLatest, concat, delay, map, retryWhen, share, switchMap, take, tap } from 'rxjs/operators';
import { FormList } from '../../+haseka/form-list/haseka-form-list';
import { Global } from '../../../environments/global';
import { Form } from '../model/Form';

@Injectable({providedIn: 'root'})
export class FormService {

  static readonly tmpNs = 'T';

  readonly forms = {
    [environment.nafiForm]: '/theme/nafi/form',
    [environment.wbcForm]: '/theme/talvilintulaskenta/form',
    [environment.invasiveControlForm]: '/theme/vieraslajit/form',
    [environment.municipalityMonitoringForm]: '/theme/kunnat/form',
    [environment.lineTransectForm]: '/theme/linjalaskenta/form/MHL.1',
    [environment.lineTransectEiVakioForm]: '/theme/linjalaskenta/form/MHL.27',
    [environment.lineTransectKartoitusForm]: '/theme/linjalaskenta/form/MHL.28',
    [environment.lolifeForm]: '/theme/lolife/form',
    [environment.batForm]: '/theme/lepakot/form',
    [environment.valioForm]: '/theme/valio/form',
    default: '/vihko'
  };

  localChanged = new EventEmitter();

  @LocalStorage() private formDataStorage;
  private currentData: any;
  private currentKey: string;
  private currentLang: string;
  private formCache: {[key: string]: Form.SchemaForm} = {};
  private jsonFormCache: {[key: string]: Form.SchemaForm} = {};
  private formPending: {[key: string]: Observable<Form.SchemaForm>} = {};
  private allForms: any[];

  constructor(
    private lajiApi: LajiApiService,
    private userService: UserService,
  ) {}

  static hasFeature(form: Form.List, feature: Form.Feature) {
    return form && Array.isArray(form.features) && form.features.indexOf(feature) !== -1;
  }

  static isTmpId(id: string) {
    return !id || (id && id.indexOf(FormService.tmpNs + ':') === 0);
  }

  discard(id?: string): void {
    if (!id) {
      id = this.currentKey;
    }
    this.getUserId().pipe(
      switchMap(userID => {
        if (this.formDataStorage[userID] && this.formDataStorage[userID][id]) {
          if (!this.formDataStorage[userID][id].formData || !this.formDataStorage[userID][id].formData._isTemplate) {
            delete this.formDataStorage[userID][id];
            this.formDataStorage = {...this.formDataStorage};
            this.localChanged.emit(true);
          }
        }
        if (this.currentKey === id) {
          this.currentData = undefined;
          this.currentKey = undefined;
        }
        return ObservableOf(true);
      }))
      .subscribe();
  }

  /**
   * @deprecated this method will be moved to laji-form-document.facade.ts
   */
  store(document: Document): Observable<string> {
    if (this.currentKey) {
      return this.getUserId().pipe(
        switchMap(userID => {
          if (!this.formDataStorage[userID]) {
            this.formDataStorage[userID] = {};
          }
          this.formDataStorage[userID][this.currentKey] = { 'formData': document, 'dateStored': new Date() };
          this.formDataStorage = {...this.formDataStorage};
          return ObservableOf(this.currentKey);
        }));
    }
    return ObservableOf('');
  }

  hasUnsavedData(id?: string, document?: Document): Observable<boolean> {
    if (!id) {
      id = this.currentKey;
    }
    return this.getUserId().pipe(
      switchMap(userID => {
        const tmpDoc = this.getTmpDoc(userID, id);
        if (FormService.isTmpId(id)) {
          return ObservableOf(tmpDoc._hasChanges);
        }

        if (document && tmpDoc) {
          return ObservableOf(
            this.isLocalNewest(tmpDoc, document)
          );
        }
        return ObservableOf(!!tmpDoc);
      }));
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

  getAllTempDocuments(): Observable<Document[]> {
    return this.getUserId().pipe(
      switchMap(userID => {
        if (!this.formDataStorage[userID]) {
          return ObservableOf([]);
        }
        return ObservableOf(
          Object.keys(this.formDataStorage[userID])
            .filter((key) => FormService.isTmpId(key))
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
      }));
  }

  getForm(formId: string, lang: string): Observable<Form.SchemaForm> {
    if (!formId) {
      return ObservableOf(null);
    }
    this.setLang(lang);
    if (this.formCache[formId]) {
      return ObservableOf(this.formCache[formId]);
    } else if (!this.formPending[formId]) {
      this.formPending[formId] = this.lajiApi.get(LajiApi.Endpoints.forms, formId, {lang}).pipe(
        retryWhen(errors => errors.pipe(delay(500), take(2), concat(observableThrowError(errors)))),
        tap((schema) => this.formCache[formId] = schema),
        share()
      );
    }
    return Observable.create((observer: Observer<Form.SchemaForm>) => {
      this.formPending[formId].subscribe(
        data => {
          observer.next(data);
          observer.complete();
        },
        error => {
          observer.error(error);
          observer.complete();
        }
        );
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
      return this.lajiApi.get(LajiApi.Endpoints.forms, formId, {lang, format: 'json'}).pipe(
        tap((jsonForm) => this.jsonFormCache[formId] = jsonForm));
    }
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

  getAddUrlPath(formId) {
    if (!formId) {
      formId = Global.forms.default;
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

  private getUserId(): Observable<string> {
    return this.userService.user$.pipe(
      take(1),
      map(person => person.id)
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
   * Return true if local dataEdited is newer than the remote dateEdited
   * @param local local copy of the document
   * @param remote remote copy of the document
   * @returns boolean
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
