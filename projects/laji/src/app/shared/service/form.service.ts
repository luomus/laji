import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Global } from '../../../environments/global';
import { map, shareReplay } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type FormListing = components['schemas']['FormListing'];
type Form = components['schemas']['Form'];

export interface JsonForm extends Omit<Form, 'schema'> {
  fields: any[];
}

function getCacheKey(formId: string, lang: string) {
  return [formId, lang].join(':');
}

@Injectable({providedIn: 'root'})
export class FormService {

  static readonly tmpNs = 'T';

  private currentLang?: string;
  private formCache: {[key: string]: Observable<Form>} = {};
  private jsonFormCache: {[key: string]: Observable<JsonForm>} = {};
  private allForms?: Observable<FormListing[]>;

  protected basePath = environment.apiBase;

  constructor(
    private api: LajiApiClientBService,
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

  private setLang(lang = this.translate.getCurrentLang()) {
    if (this.currentLang !== lang) {
      this.allForms = undefined;
      this.currentLang = lang;
    }
  }

  getForm(id: string): Observable<Form> {
    const cacheKey = getCacheKey(id, this.translate.getCurrentLang());
    if (!this.formCache[cacheKey]) {
      this.formCache[cacheKey] = this.api.get('/forms/{id}', { path: { id } });
    }
    return this.formCache[cacheKey]!;
  }

  getFormInJSONFormat(id: string): Observable<JsonForm> {
    const lang = this.translate.getCurrentLang();
    const cacheKey = getCacheKey(id, lang);
    if (!this.jsonFormCache[cacheKey]) {
      this.jsonFormCache[cacheKey] = (this.api.get('/forms/{id}', { path: { id }, query: {format: 'json'} }) as unknown as Observable<JsonForm>).pipe(
        shareReplay(1)
      );
    }
    return this.jsonFormCache[cacheKey];
  }

  getFormInListFormat(id: string) {
    return this.getAllForms().pipe(map(forms => forms.find(f => f.id === id))) as Observable<FormListing>;
  }

  getAllForms(): Observable<FormListing[]> {
    if (!this.allForms) {
      this.allForms = this.api.get('/forms').pipe(
        map(data => data.results),
        shareReplay(1)
      );
    }
    return this.allForms;
  }

  getSpreadsheetForms(): Observable<FormListing[]> {
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

  // TODO!! timeout ?
  getParticipants(form: FormListing) {
    return this.api.get('/forms/{id}/participants', { path: { id: form.id } });
    // {params: {personToken: this.userService.getToken()}, headers: {timeout: '240000'}}
    // ) as Observable<Participant[]>;
  }

  getPlaceForm(documentForm: Form) {
    const id = documentForm.options?.namedPlaceOptions?.namedPlaceFormID || Global.forms.namedPlace;
    return this.getForm(id);
  }
}
