import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IListResult, IGlobalSpeciesQuery, IGlobalSpecies, IGlobalSpeciesFilters, IGlobalRecording, IValidationStat, IUserStat, IGlobalTemplate,
  SuccessResult,
  IGlobalComment,
  IGlobalValidationData,
  IGlobalSpeciesListResult
} from '../models';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KerttuGlobalApi {

  constructor(protected httpClient: HttpClient) {
  }
  protected basePath = environment.kerttuApi + '/global';

  public getSpeciesList(personToken: string, query: IGlobalSpeciesQuery): Observable<IGlobalSpeciesListResult> {
    const path = this.basePath + '/species';

    let params = new HttpParams().set('personToken', personToken);
    params = this.queryToParams(query, params);

    return this.httpClient.get<IGlobalSpeciesListResult>(path, { params });
  }

  public getSpecies(taxonId: number): Observable<IGlobalSpecies> {
    const path = this.basePath + '/species/' + taxonId;

    return this.httpClient.get<IGlobalSpecies>(path);
  }

  public getSpeciesFilters(): Observable<IGlobalSpeciesFilters> {
    const path = this.basePath + '/species/filters';

    return this.httpClient.get<IGlobalSpeciesFilters>(path);
  }

  public getDataForValidation(taxonId: number): Observable<IListResult<IGlobalRecording>> {
    const path = this.basePath + '/recording/' + taxonId;

    return this.httpClient.get<IListResult<IGlobalRecording>>(path);
  }

  public getTemplates(taxonId: number): Observable<IListResult<IGlobalValidationData>> {
    const path = this.basePath + '/template/' + taxonId;

    return this.httpClient.get<IListResult<IGlobalValidationData>>(path);
  }

  public saveTemplates(personToken: string, taxonId: number, data: {templates: IGlobalTemplate[], comments: IGlobalComment[]}): Observable<SuccessResult> {
    const path = this.basePath + '/template/' + taxonId;
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.post<SuccessResult>(path, data, { params });
  }

  public getValidationStats(query: IGlobalSpeciesQuery): Observable<IListResult<IValidationStat>> {
    const path = this.basePath + '/statistics/validations';
    const params = this.queryToParams(query, new HttpParams());

    return this.httpClient.get<IListResult<IValidationStat>>(path, { params });
  }

  public getUserStats(query: IGlobalSpeciesQuery, personToken?: string): Observable<IListResult<IUserStat>> {
    const path = this.basePath + '/statistics/users';

    let params = new HttpParams();
    if (personToken) {
      params = params.set('personToken', personToken);
    }
    params = this.queryToParams(query, params);

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
