import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PagedResult } from 'projects/laji/src/app/shared/model/PagedResult';
import { IListResult, IKerttuSpeciesQuery, IKerttuSpecies, IKerttuSpeciesFilters, IKerttuRecording, IValidationStat, IUserStat, IKerttuLetterTemplate,
  SuccessResult } from '../models';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KerttuGlobalApi {

  constructor(protected httpClient: HttpClient) {
  }
  protected basePath = environment.kerttuApi + '/global';

  public getSpeciesList(personToken: string, query: IKerttuSpeciesQuery): Observable<PagedResult<IKerttuSpecies>> {
    const path = this.basePath + '/species';

    let params = new HttpParams().set('personToken', personToken);
    params = this.queryToParams(query, params);

    return this.httpClient.get<PagedResult<IKerttuSpecies>>(path, { params });
  }

  public getSpeciesFilters(): Observable<IKerttuSpeciesFilters> {
    const path = this.basePath + '/species/filters';

    return this.httpClient.get<IKerttuSpeciesFilters>(path);
  }

  public getDataForValidation(taxonId: number): Observable<IListResult<IKerttuRecording>> {
    const path = this.basePath + '/recording/' + taxonId;

    return this.httpClient.get<IListResult<IKerttuRecording>>(path);
  }

  public getTemplates(taxonId: number): Observable<IListResult<IKerttuLetterTemplate>> {
    const path = this.basePath + '/template/' + taxonId;

    return this.httpClient.get<IListResult<IKerttuLetterTemplate>>(path);
  }

  public saveTemplates(personToken: string, taxonId: number, templates: IKerttuLetterTemplate[]): Observable<SuccessResult> {
    const path = this.basePath + '/template/' + taxonId;
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.post<SuccessResult>(path, templates, { params });
  }

  public getValidationStats(query: IKerttuSpeciesQuery): Observable<IListResult<IValidationStat>> {
    const path = this.basePath + '/statistics/validations';
    const params = this.queryToParams(query, new HttpParams());

    return this.httpClient.get<IListResult<IValidationStat>>(path, { params });
  }

  public getUserStats(query: IKerttuSpeciesQuery, personToken?: string): Observable<IListResult<IUserStat>> {
    const path = this.basePath + '/statistics/users';

    let params = new HttpParams();
    if (personToken) {
      params = params.set('personToken', personToken);
    }
    params = this.queryToParams(query, params);

    return this.httpClient.get<IListResult<IUserStat>>(path, { params });
  }

  private queryToParams(query: IKerttuSpeciesQuery, params: HttpParams) {
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
