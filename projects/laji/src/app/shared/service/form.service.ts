import { Injectable } from '@angular/core';
import { Observable, of as ObservableOf, throwError as observableThrowError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LajiApi, LajiApiService } from './laji-api.service';
import { Global } from '../../../environments/global';
import { catchError, concat, delay, map, retryWhen, shareReplay, take } from 'rxjs/operators';
import { Form } from '../model/Form';
import { UserService } from './user.service';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

export interface Participant {
  id?: string;
  fullName?: string;
  emailAddress?: string;
  address?: string;
  lintuvaaraLoginName?: string[];
  lastDoc?: number;
}

function getCacheKey(formId: string, lang: string) {
  return [formId, lang].join(':');
}

@Injectable({providedIn: 'root'})
export class FormService {

  static readonly tmpNs = 'T';

  private currentLang?: string;
  private formCache: {[key: string]: Observable<Form.SchemaForm | undefined>} = {};
  private jsonFormCache: {[key: string]: Observable<Form.JsonForm>} = {};
  private allForms?: Observable<Form.List[]>;

  protected basePath = environment.apiBase;

  constructor(
    private lajiApi: LajiApiService,
    private http: HttpClient,
    private userService: UserService,
    private translate: TranslateService
  ) {
    this.translate.onLangChange.subscribe(e => this.setLang(e.lang));
  }

  static isTmpId(id: string): boolean {
    return id?.indexOf(FormService.tmpNs + ':') === 0;
  }

  private getFormAlias(formId: string) {
    return Object.keys(Global.formAliasMap).find(key => Global.formAliasMap[key] === formId);
  }

  private setLang(lang = this.translate.currentLang) {
    if (this.currentLang !== lang) {
      this.allForms = undefined;
      this.currentLang = lang;
    }
  }

  getForm(formId: string): Observable<Form.SchemaForm | undefined> {
    if (!formId) {
      return ObservableOf(undefined);
    }
    const cacheKey = getCacheKey(formId, this.translate.currentLang);
    if (!this.formCache[cacheKey]) {
      this.formCache[cacheKey] = this.lajiApi.get(LajiApi.Endpoints.forms, formId, {lang: this.translate.currentLang}).pipe(
        catchError(error => error.status === 404 ? ObservableOf(undefined) : observableThrowError(error)),
        retryWhen(errors => errors.pipe(delay(1000), take(2), concat(observableThrowError(errors)))),
        shareReplay(1)
      );
    }
    return this.formCache[cacheKey];
  }

  getFormInJSONFormat(formId?: string): Observable<Form.JsonForm> {
    if (!formId) {
      return ObservableOf({} as Form.JsonForm);
    }
    const lang = this.translate.currentLang;
    const cacheKey = getCacheKey(formId, lang);
    if (!this.jsonFormCache[cacheKey]) {
      this.jsonFormCache[cacheKey] = this.lajiApi.get(LajiApi.Endpoints.forms, formId, {lang, format: 'json'}).pipe(
        shareReplay(1)
      );
    }
    return this.jsonFormCache[cacheKey];
  }

  getFormInListFormat(formId: string): Observable<Form.List> {
    return this.getAllForms().pipe(map(forms => forms.find(f => f.id === formId) as Form.List));
  }

  getAllForms(): Observable<Form.List[]> {
    if (!this.allForms) {
      this.allForms = this.lajiApi.getList(LajiApi.Endpoints.forms, {lang: this.translate.currentLang}).pipe(
        map(data => data.results),
        shareReplay(1)
      );
    }
    return this.allForms;
  }

  getSpreadsheetForms(): Observable<Form.List[]> {
    return this.getAllForms().pipe(map(forms => forms.filter(form => form.options?.allowExcel)));
  }

  getGloballyAllowedSpreadsheetForms() {
   return this.getSpreadsheetForms().pipe(map(forms => forms.filter(form => !form.options?.excludeFromGlobalExcel)));
  }

  getAddUrlPath(formId: string) {
    return `/project/${formId}/form`;
  }

  getEditUrlPath(formId: string, documentId: string) {
    const alias = this.getFormAlias(formId);
    if (alias) {
      return `${this.getAddUrlPath(alias)}/${documentId}`;
    }

    return `${this.getAddUrlPath(formId)}/${documentId}`;
  }

  getParticipants(form: Form.List) {
    return this.http.get(
      `${this.basePath}/${LajiApi.Endpoints.forms}/${form.id}/participants`,
    {params: {personToken: this.userService.getToken()}, headers: {timeout: '240000'}}
    ) as Observable<Participant[]>;
  }

  getPlaceForm(documentForm: Form.SchemaForm) {
    const id = documentForm.options?.namedPlaceOptions?.namedPlaceFormID || Global.forms.namedPlace;
    return this.getForm(id);
  }
}
