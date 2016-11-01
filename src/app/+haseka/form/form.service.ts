import { Injectable, Inject } from '@angular/core';
import { Subscription, Observable, Observer } from 'rxjs';
import { LocalStorage } from 'angular2-localstorage/dist';
import { UserService } from '../../shared/service/user.service';
import { Util } from '../../shared/service/util.service';
import { FormApi } from '../../shared/api/FormApi';
import { DocumentApi } from '../../shared/api/DocumentApi';


@Injectable()
export class FormService {

  @LocalStorage() private formDataStorage = {};
  private currentData: any;
  private currentKey: string;
  private formSchema: any;
  private formCache: string;

  constructor(
    private formApi: FormApi,
    private userService: UserService,
    private documentApi: DocumentApi
  ) {}

  discard(id?: string) {
    if (!id) {
      id = this.currentKey;
    }
    if (this.formDataStorage[id]) {
      delete this.formDataStorage[id];
    }
  }

  store(formData) {
    if (this.currentKey) {
      this.formDataStorage[this.currentKey] = formData;
    }
  }

  hasUnsavedData(id?: string, document?: any): boolean {
    if (!id) {
      id = this.currentKey;
    }
    let result = typeof this.formDataStorage[id] !== 'undefined';
    if (document && result) {
      return this.isLocalNewest(this.formDataStorage[id], document);
    }
    return result;
  }

  getFormSchema() {
    return this.formSchema;
  }

  getDataWithoutChanges() {
    return this.currentData;
  }

  setCurrentData(data: any) {
    this.currentData = Util.clone(data);
  }

  getOriginalData() {
    if (!this.currentData) {
      throw new Error('No current form data found!');
    }
    return this.currentData;
  }

  load(formId: string, lang: string, documentId?: string): Observable<any> {
    let cacheKey = formId + lang;
    let data$ = this.userService.getDefaultFormData();
    let form$ = this.formApi.formFindById(formId, lang)
      .do((schema) => {
        this.formSchema = schema;
        this.formCache = cacheKey;
      });
    if (this.formCache === cacheKey) {
      form$ = Observable.of(this.formSchema);
    }
    if (documentId) {
      data$ = this.documentApi.findById(documentId, this.userService.getToken());
    }
    return data$
      .do(data => this.setCurrentData(data))
      .switchMap(data => {
        this.setCurrentData(data);
        return form$
          .combineLatest(
            this.getDefaultData(formId, documentId, this.currentData),
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
    return this.localFrmDataIfNoNewer(documentId, current);
  }

  private localFrmDataIfNoNewer(documentId: string, current?: any) {
    if (!current) {
      throw new Error('No current form data given!');
    }
    this.currentKey = documentId;
    this.setCurrentData(current);
    if (!this.formDataStorage[documentId]) {
      return Observable.of(current);
    }
    if (this.isLocalNewest(this.formDataStorage[documentId], current)) {
      return Observable.of(this.formDataStorage[documentId]);
    }
    delete this.formDataStorage[documentId];
    return Observable.of(current);
  }

  private defaultFormData(formId: string) {
    this.currentKey = formId;
    if (this.formDataStorage[formId]) {
      return Observable.of(this.formDataStorage[formId]);
    }
    return this.userService.getDefaultFormData()
      .map((data) => {
        data['formID'] = formId;
        return data;
      })
      .do((data) => this.currentData = Util.clone(data));
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
    let dateArray = reggie.exec(dateString);
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
