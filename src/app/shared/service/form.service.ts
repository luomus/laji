import { Injectable } from '@angular/core';
import { Observable, of as ObservableOf, throwError as observableThrowError } from 'rxjs';
import { LocalStorage } from 'ngx-webstorage';
import { environment } from '../../../environments/environment';
import { LajiApi, LajiApiService } from './laji-api.service';
import { catchError, concat, delay, map, retryWhen, shareReplay, take } from 'rxjs/operators';
import { Global } from '../../../environments/global';
import { Form } from '../model/Form';
import { UserService } from './user.service';
import { HttpClient } from '@angular/common/http';
import { CacheService } from './cache.service';

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

  readonly forms = {
    [environment.nafiForm]: '/theme/nafi/form',
    [environment.wbcForm]: '/theme/talvilintulaskenta/form',
    [environment.invasiveControlForm]: '/theme/vieraslajit/form',
    [environment.municipalityMonitoringForm]: '/theme/kunnat/form',
    [environment.lineTransectForm]: '/theme/linjalaskenta/form/MHL.1',
    [environment.lineTransectEiVakioForm]: '/theme/linjalaskenta/form/MHL.27',
    [environment.lineTransectKartoitusForm]: '/theme/linjalaskenta/form/MHL.28',
    [environment.waterbirdPairForm]: '/theme/vesilintulaskenta/form/MHL.65',
    [environment.waterbirdJuvenileForm]: '/theme/vesilintulaskenta/form/MHL.66',
    [environment.lolifeForm]: '/theme/lolife/form',
    [environment.batForm]: '/theme/lepakot/form',
    [environment.valioForm]: '/theme/valio/form',
    [environment.birdPointCountForm]: '/theme/pistelaskenta/form',
    default: '/vihko'
  };

  @LocalStorage() private formDataStorage;
  private currentLang: string;
  private formCache: {[key: string]: Observable<Form.SchemaForm>} = {};
  private jsonFormCache: {[key: string]: Observable<Form.SchemaForm>} = {};
  private allForms: Observable<Form.List[]>;

  protected basePath = environment.apiBase;

  constructor(
    private lajiApi: LajiApiService,
    private http: HttpClient,
    private userService: UserService,
    private cacheService: CacheService
  ) {}

  static hasFeature(form: Form.List, feature: Form.Feature): boolean {
    return form && Array.isArray(form.features) && form.features.indexOf(feature) !== -1;
  }

  static isTmpId(id: string): boolean {
    return !id || (id && id.indexOf(FormService.tmpNs + ':') === 0);
  }

  getForm(formId: string, lang: string): Observable<Form.SchemaForm> {
    if (!formId) {
      return ObservableOf(null);
    }
    this.setLang(lang);
    if (!this.formCache[formId]) {
      const form$ = this.lajiApi.get(LajiApi.Endpoints.forms, formId, {lang});
      this.formCache[formId] = this.cacheService.getCachedObservable(form$, `form-${formId}-${lang}`).pipe(
        catchError(error => error.status === 404 ? ObservableOf(null) : observableThrowError(error)),
        retryWhen(errors => errors.pipe(delay(1000), take(2), concat(observableThrowError(errors)))),
        shareReplay(1)
      );
    }
    return this.formCache[formId];
  }

  getFormInJSONFormat(formId: string, lang: string): Observable<any> {
    if (!formId) {
      return ObservableOf({});
    }
    this.setLang(lang);
    if (!this.jsonFormCache[formId]) {
      this.jsonFormCache[formId] = this.lajiApi.get(LajiApi.Endpoints.forms, formId, {lang, format: 'json'}).pipe(
        shareReplay(1)
      );
    }
    return this.jsonFormCache[formId];
  }

  getAllForms(lang: string, whitelistedOnly = false): Observable<Form.List[]> {
    this.setLang(lang);
    if (!this.allForms) {
      const allForms$ = this.lajiApi.getList(LajiApi.Endpoints.forms, {lang: this.currentLang}).pipe(
        map(data => data.results)
      );
      this.allForms = this.cacheService.getCachedObservable(allForms$, `forms-all-${this.currentLang}`).pipe(
        shareReplay(1)
      );
    }
    if (whitelistedOnly) {
      return this.allForms.pipe(
        map((forms) => forms.filter(form => this.isFormAllowed(form.id))),
      );
    }
    return this.allForms;
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

  getParticipants(form: Form.List) {
    return this.http.get(
      `${this.basePath}/${LajiApi.Endpoints.forms}/${form.id}/participants`,
    {params: {personToken: this.userService.getToken()}}
    ) as Observable<Participant[]>;
  }

  private isFormAllowed(formId: string) {
    const forms = environment.formWhitelist;
    if (forms.length === 0) {
      return true;
    }
    return forms.indexOf(formId) !== -1;
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
