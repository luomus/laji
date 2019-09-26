import { Injectable } from '@angular/core';
import { Observable, Observer, of, of as ObservableOf, throwError as observableThrowError } from 'rxjs';
import { LocalStorage } from 'ngx-webstorage';
import { environment } from '../../../environments/environment';
import { LajiApi, LajiApiService } from './laji-api.service';
import { catchError, concat, delay, map, retryWhen, share, switchMap, take, tap } from 'rxjs/operators';
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

  @LocalStorage() private formDataStorage;
  private currentLang: string;
  private formCache: {[key: string]: Form.SchemaForm} = {};
  private jsonFormCache: {[key: string]: Form.SchemaForm} = {};
  private formPending: {[key: string]: Observable<Form.SchemaForm>} = {};
  private allForms: Form.List[];

  constructor(
    private lajiApi: LajiApiService
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
    if (this.formCache[formId]) {
      return ObservableOf(JSON.parse(JSON.stringify(this.formCache[formId])));
    } else if (!this.formPending[formId]) {
      this.formPending[formId] = this.lajiApi.get(LajiApi.Endpoints.forms, formId, {lang}).pipe(
        catchError(error => error.status === 404 ? of(null) : observableThrowError(error)),
        retryWhen(errors => errors.pipe(delay(1000), take(2), concat(observableThrowError(errors)))),
        tap((schema) => this.formCache[formId] = schema),
        share()
      );
    }
    return new Observable((observer: Observer<Form.SchemaForm>) => {
      this.formPending[formId].subscribe(
        data => {
          observer.next(JSON.parse(JSON.stringify(data)));
          observer.complete();
        },
        error => {
          observer.error(error);
          observer.complete();
        }
      );
    });
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

  getAllForms(lang: string): Observable<Form.List[]> {
    this.setLang(lang);
    return this.allForms ?
      ObservableOf(this.allForms) :
      this.lajiApi.getList(LajiApi.Endpoints.forms, {lang: this.currentLang}).pipe(
        map((forms) => forms.results.filter(form => this.isFormAllowed(form.id))),
        tap((forms) => this.allForms = forms)
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
      this.formPending = {};
      this.allForms = undefined;
      this.currentLang = lang;
    }
  }
}
