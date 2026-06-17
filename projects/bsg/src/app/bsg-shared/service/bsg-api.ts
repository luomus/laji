import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ListResult,
  SpeciesQuery,
  Species,
  SpeciesFilters,
  ValidationAudioData,
  ValidationCountStatistics,
  ValidationUserStatistics,
  Template,
  SuccessResult,
  TemplateComment,
  TemplateVersion,
  SpeciesListResult,
  BsgErrorEnum,
  RecordingAnnotation,
  Site,
  SiteStatistics,
  IdentificationUserStatisticsData,
  IdentificationSpeciesStatistics,
  IdentificationHistoryResponse,
  IdentificationHistoryQuery,
  RecordingWithAnnotation, TaxonTypeEnum, XenoCantoExportData
} from '../models';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../../../../../laji/src/app/shared/model/PagedResult';
import { PlatformService } from 'projects/laji/src/app/root/platform.service';

@Injectable({
  providedIn: 'root'
})
export class BsgApi {

  constructor(
    private platformService: PlatformService,
    protected httpClient: HttpClient
  ) { }

  protected basePath = environment.bsgApi + '/global';

  public static getErrorMessage(error: any): BsgErrorEnum {
    while (error.error) {
      error = error.error;
    }
    return error.message || error.body?.message;
  }

  public getSpeciesList(personToken: string, lang: string, query: SpeciesQuery): Observable<SpeciesListResult> {
    const path = this.basePath + '/species';

    let params = new HttpParams().set('personToken', personToken).set('lang', lang);
    params = this.queryToParams(query, params);

    return this.httpClient.get<SpeciesListResult>(path, { params });
  }

  public getSpecies(lang: string, speciesId: number, includeValidationCount?: boolean): Observable<Species> {
    const path = this.basePath + '/species/' + speciesId;

    let params = new HttpParams().set('lang', lang);
    if (includeValidationCount != null) {
      params = params.set('includeValidationCount', includeValidationCount);
    }

    return this.httpClient.get<Species>(path, { params });
  }

  public lockSpecies(personToken: string, speciesId: number): Observable<SuccessResult> {
    const path = this.basePath + '/species/lock/' + speciesId;
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.post<SuccessResult>(path, {}, { params });
  }

  public unlockSpecies(personToken: string, speciesId: number): boolean {
    const path = this.basePath + '/species/unlock/' + speciesId + '?personToken=' + personToken;

    return this.platformService.window.navigator.sendBeacon(path);
  }

  public getSpeciesFilters(): Observable<SpeciesFilters> {
    const path = this.basePath + '/species/filters';

    return this.httpClient.get<SpeciesFilters>(path);
  }

  public getSoundTypes(taxonType: TaxonTypeEnum): Observable<ListResult<string>> {
    const path = this.basePath + '/species/soundTypes';
    const params = new HttpParams().set('taxonType', '' + taxonType);

    return this.httpClient.get<ListResult<string>>(path, { params });
  }

  public getValidationRecordings(lang: string, speciesId: number): Observable<ListResult<ValidationAudioData>> {
    const path = this.basePath + '/recordings/' + speciesId;
    const params = new HttpParams().set('lang', lang);

    return this.httpClient.get<ListResult<ValidationAudioData>>(path, { params });
  }

  public getTemplateVersions(taxonId: number): Observable<ListResult<TemplateVersion>> {
    const path = this.basePath + '/templates/' + taxonId;

    return this.httpClient.get<ListResult<TemplateVersion>>(path);
  }

  public saveTemplates(personToken: string, taxonId: number, data: {
    templates: (Template|null)[]; comments: TemplateComment[];
  }): Observable<SuccessResult> {
    const path = this.basePath + '/templates/' + taxonId;
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.post<SuccessResult>(path, data, { params });
  }

  public getValidationCountStatistics(query: SpeciesQuery): Observable<ListResult<ValidationCountStatistics>> {
    const path = this.basePath + '/statistics/validations';
    const params = this.queryToParams(query, new HttpParams());

    return this.httpClient.get<ListResult<ValidationCountStatistics>>(path, { params });
  }

  public getValidationUserStatistics(query: SpeciesQuery): Observable<ListResult<ValidationUserStatistics>> {
    const path = this.basePath + '/statistics/users';
    const params = this.queryToParams(query, new HttpParams());

    return this.httpClient.get<ListResult<ValidationUserStatistics>>(path, { params });
  }

  public getNewIdentificationRecording(
    personToken: string,
    lang: string,
    siteIds: number[]|null,
    speciesIds: number[]|null,
    unknownSpecies: boolean|null,
    previousRecordingId?: number|null,
    excludeRecordingIds?: (number|null)[],
    fileNameFilter?: string
  ): Observable<RecordingWithAnnotation> {
    const path = this.basePath + '/identification/recordings/new';

    let params = new HttpParams().set('personToken', personToken).set('lang', lang);
    if (siteIds) {
      params = params.set('sites', '' + siteIds);
    }
    if (speciesIds) {
      params = params.set('species', '' + speciesIds);
    }
    if (unknownSpecies != null) {
      params = params.set('unknownSpecies', '' + unknownSpecies);
    }
    if (previousRecordingId != null) {
      params = params.set('previousRecording', '' + previousRecordingId);
    }
    if (excludeRecordingIds) {
      params = params.set('excludeRecordings', '' + excludeRecordingIds);
    }
    if (fileNameFilter) {
      params = params.set('fileNameFilter', fileNameFilter);
    }

    return this.httpClient.get<RecordingWithAnnotation>(path, { params });
  }

  public getIdentificationRecording(personToken: string, lang: string, recordingId: number): Observable<RecordingWithAnnotation> {
    const path = this.basePath + '/identification/recordings/' + recordingId;
    const params = new HttpParams().set('personToken', personToken).set('lang', lang);

    return this.httpClient.get<RecordingWithAnnotation>(path, { params });
  }

  public getIdentificationXenoCantoRecording(personToken: string, lang: string, xcId: number): Observable<RecordingWithAnnotation> {
    const path = this.basePath + '/identification/xeno-canto/' + xcId;
    const params = new HttpParams().set('personToken', personToken).set('lang', lang);

    return this.httpClient.get<RecordingWithAnnotation>(path, { params });
  }

  public saveRecordingAnnotation(
    personToken: string, recordingId: number, annotation: RecordingAnnotation, isDraft = false, skipRecording = false
  ): Observable<SuccessResult> {
    const path = this.basePath + '/identification/recordings/' + recordingId + '/annotation';
    const params = new HttpParams().set('personToken', personToken).set('isDraft', isDraft).set('skipRecording', skipRecording);

    return this.httpClient.post<SuccessResult>(path, annotation, { params });
  }

  public getSites(taxonTypes: TaxonTypeEnum[]|null, personToken: string): Observable<ListResult<Site>> {
    const path = this.basePath + '/identification/sites';

    let params = new HttpParams().set('personToken', personToken);
    if (taxonTypes) {
      params = params.set('taxonTypes', '' + taxonTypes);
    }

    return this.httpClient.get<ListResult<Site>>(path, { params });
  }

  public getIdentificationSiteStatistics(taxonTypes: TaxonTypeEnum[]|null): Observable<ListResult<SiteStatistics>> {
    const path = this.basePath + '/identification/statistics/sites';

    let params = new HttpParams();
    if (taxonTypes) {
      params = params.set('taxonTypes', '' + taxonTypes);
    }

    return this.httpClient.get<ListResult<SiteStatistics>>(path, { params });
  }

  public getIdentificationUserStatistics(taxonTypes: TaxonTypeEnum[]|null): Observable<IdentificationUserStatisticsData> {
    const path = this.basePath + '/identification/statistics/users';

    let params = new HttpParams();
    if (taxonTypes) {
      params = params.set('taxonTypes', '' + taxonTypes);
    }
    return this.httpClient.get<IdentificationUserStatisticsData>(path, { params });
  }

  public getIdentificationSpeciesStatistics(taxonTypes: TaxonTypeEnum[]|null, lang: string): Observable<ListResult<IdentificationSpeciesStatistics>> {
    const path = this.basePath + '/identification/statistics/species';

    let params = new HttpParams().set('lang', lang);
    if (taxonTypes) {
      params = params.set('taxonTypes', '' + taxonTypes);
    }

    return this.httpClient.get<ListResult<IdentificationSpeciesStatistics>>(path, { params });
  }

  public getIdentificationOwnSpeciesStatistics(
    taxonTypes: TaxonTypeEnum[]|null, personToken: string, lang: string
  ): Observable<ListResult<IdentificationSpeciesStatistics>> {
    const path = this.basePath + '/identification/statistics/ownSpecies';

    let params = new HttpParams().set('personToken', personToken).set('lang', lang);
    if (taxonTypes) {
      params = params.set('taxonTypes', '' + taxonTypes);
    }

    return this.httpClient.get<ListResult<IdentificationSpeciesStatistics>>(path, { params });
  }

  public getIdentificationHistory(personToken: string, query: IdentificationHistoryQuery): Observable<PagedResult<IdentificationHistoryResponse>> {
    const path = this.basePath + '/identification/history';
    let params = new HttpParams().set('personToken', personToken);
    params = this.queryToParams(query, params);

    return this.httpClient.get<PagedResult<IdentificationHistoryResponse>>(path, { params });
  }

  public exportToXenoCanto(personToken: string, xenoCantoApiKey: string, data: XenoCantoExportData): Observable<SuccessResult> {
    const path = this.basePath + '/identification/xeno-canto/export';
    const params = new HttpParams().set('personToken', personToken).set('xenoCantoApiKey', xenoCantoApiKey);

    return this.httpClient.post<SuccessResult>(path, data, { params });
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
