import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import {
  IListResult,
  IGlobalSpeciesQuery,
  IGlobalSpecies,
  IGlobalSpeciesFilters,
  IGlobalRecording,
  IValidationStat,
  IUserStat,
  IGlobalTemplate,
  ISuccessResult,
  IGlobalComment,
  IGlobalTemplateVersion,
  IGlobalSpeciesListResult,
  KerttuGlobalErrorEnum,
  IGlobalRecordingAnnotation,
  IGlobalSite,
  IIdentificationSiteStat,
  IIdentificationUserStatResult,
  IIdentificationSpeciesStat,
  IIdentificationHistoryResponse,
  IIdentificationHistoryQuery,
  IGlobalRecordingWithAnnotation
} from '../models';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WINDOW } from '@ng-toolkit/universal';
import { PagedResult } from '../../../../../laji/src/app/shared/model/PagedResult';

@Injectable({
  providedIn: 'root'
})
export class KerttuGlobalApi {

  constructor(
    @Inject(WINDOW) private window: Window,
    protected httpClient: HttpClient
  ) { }

  protected basePath = environment.kerttuApi + '/global';

  public static getErrorMessage(error): KerttuGlobalErrorEnum {
    while (error.error) {
      error = error.error;
    }
    return error.message || error.body?.message;
  }

  public getSpeciesList(personToken: string, lang: string, query: IGlobalSpeciesQuery): Observable<IGlobalSpeciesListResult> {
    const path = this.basePath + '/species';

    let params = new HttpParams().set('personToken', personToken).set('lang', lang);
    params = this.queryToParams(query, params);

    return this.httpClient.get<IGlobalSpeciesListResult>(path, { params });
  }

  public getSpecies(lang: string, speciesId: number, includeValidationCount?: boolean): Observable<IGlobalSpecies> {
    const path = this.basePath + '/species/' + speciesId;

    let params = new HttpParams().set('lang', lang);
    if (includeValidationCount != null) {
      params = params.set('includeValidationCount', includeValidationCount);
    }

    return this.httpClient.get<IGlobalSpecies>(path, { params });
  }

  public lockSpecies(personToken: string, speciesId: number): Observable<ISuccessResult> {
    const path = this.basePath + '/species/lock/' + speciesId;
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.post<ISuccessResult>(path, {}, { params });
  }

  public unlockSpecies(personToken: string, speciesId: number): boolean {
    const path = this.basePath + '/species/unlock/' + speciesId + '?personToken=' + personToken;

    return this.window.navigator.sendBeacon(path);
  }

  public getSpeciesFilters(): Observable<IGlobalSpeciesFilters> {
    const path = this.basePath + '/species/filters';

    return this.httpClient.get<IGlobalSpeciesFilters>(path);
  }

  public getRecordings(lang: string, speciesId: number): Observable<IListResult<IGlobalRecording>> {
    const path = this.basePath + '/recordings/' + speciesId;
    const params = new HttpParams().set('lang', lang);

    return this.httpClient.get<IListResult<IGlobalRecording>>(path, { params });
  }

  public getTemplateVersions(taxonId: number): Observable<IListResult<IGlobalTemplateVersion>> {
    const path = this.basePath + '/templates/' + taxonId;

    return this.httpClient.get<IListResult<IGlobalTemplateVersion>>(path);
  }

  public saveTemplates(personToken: string, taxonId: number, data: {
    templates: IGlobalTemplate[]; comments: IGlobalComment[];
  }): Observable<ISuccessResult> {
    const path = this.basePath + '/templates/' + taxonId;
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.post<ISuccessResult>(path, data, { params });
  }

  public getValidationStats(query: IGlobalSpeciesQuery): Observable<IListResult<IValidationStat>> {
    const path = this.basePath + '/statistics/validations';
    const params = this.queryToParams(query, new HttpParams());

    return this.httpClient.get<IListResult<IValidationStat>>(path, { params });
  }

  public getUserStats(query: IGlobalSpeciesQuery): Observable<IListResult<IUserStat>> {
    const path = this.basePath + '/statistics/users';
    const params = this.queryToParams(query, new HttpParams());

    return this.httpClient.get<IListResult<IUserStat>>(path, { params });
  }

  public getNewIdentificationRecording(
    personToken: string, lang: string, siteIds: number[], previousRecordingId?: number, excludeRecordingIds?: number[]
  ): Observable<IGlobalRecordingWithAnnotation> {
    const path = this.basePath + '/identification/recordings/new';
    let params = new HttpParams().set('personToken', personToken).set('lang', lang).set('sites', '' + siteIds);

    if (previousRecordingId != null) {
      params = params.set('previousRecording', '' + previousRecordingId);
    }
    if (excludeRecordingIds) {
      params = params.set('excludeRecordings', '' + excludeRecordingIds);
    }

    return this.httpClient.get<IGlobalRecordingWithAnnotation>(path, { params });
  }

  public getIdentificationRecording(personToken: string, lang: string, recordingId: number): Observable<IGlobalRecordingWithAnnotation> {
    const path = this.basePath + '/identification/recordings/' + recordingId;
    const params = new HttpParams().set('personToken', personToken).set('lang', lang);

    return this.httpClient.get<IGlobalRecordingWithAnnotation>(path, { params });
  }

  public saveRecordingAnnotation(personToken: string, recordingId: number, annotation: IGlobalRecordingAnnotation, isDraft = false, skipRecording = false) {
    const path = this.basePath + '/identification/recordings/' + recordingId + '/annotation';
    const params = new HttpParams().set('personToken', personToken).set('isDraft', isDraft).set('skipRecording', skipRecording);

    return this.httpClient.post(path, annotation, { params });
  }

  public getSites(personToken: string): Observable<IListResult<IGlobalSite>> {
    const path = this.basePath + '/identification/sites';
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.get<IListResult<IGlobalSite>>(path, { params });
  }

  public getIdentificationSiteStats(): Observable<IListResult<IIdentificationSiteStat>> {
    const path = this.basePath + '/identification/statistics/sites';

    return this.httpClient.get<IListResult<IIdentificationSiteStat>>(path);
  }

  public getIdentificationUserStats(): Observable<IIdentificationUserStatResult> {
    const path = this.basePath + '/identification/statistics/users';

    return this.httpClient.get<IIdentificationUserStatResult>(path);
  }

  public getIdentificationSpeciesStats(lang: string): Observable<IListResult<IIdentificationSpeciesStat>> {
    const path = this.basePath + '/identification/statistics/species';
    const params = new HttpParams().set('lang', lang);

    return this.httpClient.get<IListResult<IIdentificationSpeciesStat>>(path, { params });
  }

  public getIdentificationOwnSpeciesStats(personToken: string, lang: string): Observable<IListResult<IIdentificationSpeciesStat>> {
    const path = this.basePath + '/identification/statistics/ownSpecies';
    const params = new HttpParams().set('personToken', personToken).set('lang', lang);

    return this.httpClient.get<IListResult<IIdentificationSpeciesStat>>(path, { params });
  }

  public getIdentificationHistory(personToken: string, query: IIdentificationHistoryQuery): Observable<PagedResult<IIdentificationHistoryResponse>> {
    const path = this.basePath + '/identification/history';
    let params = new HttpParams().set('personToken', personToken);
    params = this.queryToParams(query, params);

    return this.httpClient.get<PagedResult<IIdentificationHistoryResponse>>(path, { params });
  }

  private queryToParams(query: Record<string, any>, params: HttpParams) {
    Object.keys(query).forEach(key => {
      const value = query[key];
      if (value == null || (Array.isArray(value) && value.length === 0)) {
        return;
      }
      params = params.append(key, '' + value);
    });

    return params;
  }
}
