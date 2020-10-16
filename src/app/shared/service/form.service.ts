import { Injectable } from '@angular/core';
import { Observable, of as ObservableOf, throwError as observableThrowError } from 'rxjs';
import { LocalStorage } from 'ngx-webstorage';
import { environment } from '../../../environments/environment';
import { LajiApi, LajiApiService } from './laji-api.service';
import { catchError, concat, delay, filter, map, retryWhen, shareReplay, take } from 'rxjs/operators';
import { Global } from '../../../environments/global';
import { Form } from '../model/Form';
import { UserService } from './user.service';
import { HttpClient } from '@angular/common/http';

export interface Participant {
  id?: string;
  fullName?: string;
  emailAddress?: string;
  address?: string;
  lintuvaaraLoginName?: string[];
  lastDoc?: number;
}

@Injectable({providedIn: 'root'})
export class FormService {

  static readonly tmpNs = 'T';

  @LocalStorage() private formDataStorage;
  private currentLang: string;
  private formCache: {[key: string]: Observable<Form.SchemaForm>} = {};
  private jsonFormCache: {[key: string]: Observable<Form.JsonForm>} = {};
  private allForms: Observable<Form.List[]>;

  protected basePath = environment.apiBase;

  constructor(
    private lajiApi: LajiApiService,
    private http: HttpClient,
    private userService: UserService
  ) {}

  static isTmpId(id: string): boolean {
    return !id || (id && id.indexOf(FormService.tmpNs + ':') === 0);
  }

  getForm(formId: string, lang: string): Observable<Form.SchemaForm> {
    if (!formId) {
      return ObservableOf(null);
    }
    this.setLang(lang);
    if (!this.formCache[formId]) {
      this.formCache[formId] = this.lajiApi.get(LajiApi.Endpoints.forms, formId, {lang}).pipe(
        catchError(error => error.status === 404 ? ObservableOf(null) : observableThrowError(error)),
        retryWhen(errors => errors.pipe(delay(1000), take(2), concat(observableThrowError(errors)))),
        shareReplay(1)
      );
    }
    return this.formCache[formId];
  }

  getFormInJSONFormat(formId: string, lang: string): Observable<Form.JsonForm> {
    if (!formId) {
      return ObservableOf({} as Form.JsonForm);
    }
    this.setLang(lang);
    if (!this.jsonFormCache[formId]) {
      this.jsonFormCache[formId] = this.lajiApi.get(LajiApi.Endpoints.forms, formId, {lang, format: 'json'}).pipe(
        shareReplay(1)
      );
    }
    return this.jsonFormCache[formId];
  }

  getAllForms(lang: string): Observable<Form.List[]> {
    this.setLang(lang);
    if (!this.allForms) {
      this.allForms = this.lajiApi.getList(LajiApi.Endpoints.forms, {lang: this.currentLang}).pipe(
        map(data => data.results),
        shareReplay(1)
      );
    }
    return this.allForms;
  }

  getSpreadsheetForms(): Observable<Form.List[]> {
    return this.getAllForms(this.currentLang).pipe(map(forms => forms.filter(form => form.options?.allowExcel)));
  }

  getAddUrlPath(formId) {
    return (formId === Global.forms.default || formId === Global.forms.privateCollection)
      ? `/vihko/${formId}`
      : `/project/${formId}/form`;
  }

  getEditUrlPath(formId, documentId) {
    return `${this.getAddUrlPath(formId)}/${documentId}`;
  }

  getParticipants(form: Form.List) {
    return this.http.get(
      `${this.basePath}/${LajiApi.Endpoints.forms}/${form.id}/participants`,
    {params: {personToken: this.userService.getToken()}}
    ) as Observable<Participant[]>;
  }

  private setLang(lang: string) {
    if (this.currentLang !== lang) {
      this.formCache = {};
      this.jsonFormCache = {};
      this.allForms = undefined;
      this.currentLang = lang;
    }
  }
}
