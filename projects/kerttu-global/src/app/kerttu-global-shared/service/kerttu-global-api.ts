import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import {
  IListResult, IGlobalSpeciesQuery, IGlobalSpecies, IGlobalSpeciesFilters, IGlobalRecording, IValidationStat, IUserStat, IGlobalTemplate,
  ISuccessResult, IGlobalComment, IGlobalTemplateVersion, IGlobalSpeciesListResult, KerttuGlobalErrorEnum
} from '../models';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WINDOW } from '@ng-toolkit/universal';

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

  public getSpeciesList(personToken: string, query: IGlobalSpeciesQuery): Observable<IGlobalSpeciesListResult> {
    const path = this.basePath + '/species';

    let params = new HttpParams().set('personToken', personToken);
    params = this.queryToParams(query, params);

    return this.httpClient.get<IGlobalSpeciesListResult>(path, { params });
  }

  public getSpecies(speciesId: number): Observable<IGlobalSpecies> {
    const path = this.basePath + '/species/' + speciesId;

    return this.httpClient.get<IGlobalSpecies>(path);
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

  public getRecordings(speciesId: number): Observable<IListResult<IGlobalRecording>> {
    const path = this.basePath + '/recordings/' + speciesId;

    return this.httpClient.get<IListResult<IGlobalRecording>>(path);
  }

  public getTemplateVersions(taxonId: number): Observable<IListResult<IGlobalTemplateVersion>> {
    const path = this.basePath + '/templates/' + taxonId;

    return this.httpClient.get<IListResult<IGlobalTemplateVersion>>(path);
  }

  public saveTemplates(personToken: string, taxonId: number, data: {
    templates: IGlobalTemplate[], comments: IGlobalComment[]
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

  private queryToParams(query: IGlobalSpeciesQuery, params: HttpParams) {
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
