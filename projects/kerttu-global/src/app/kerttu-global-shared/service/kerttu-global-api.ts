import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PagedResult } from 'projects/laji/src/app/shared/model/PagedResult';
import { IListResult, IKerttuSpeciesQuery, IKerttuSpecies, IKerttuSpeciesFilters, IKerttuRecording, IValidationStat, IUserStat } from '../models';
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
    Object.keys(query).forEach(key => {
        const value = query[key];
        if (value == null || (Array.isArray(value) && value.length === 0)) {
          return;
        }
        params = params.append(key, '' + value);
    });

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

  public saveAnnotations(personToken: string, taxonId: number, annotations): Observable<any> {
    const path = this.basePath + '/annotation/' + taxonId;
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.post(path, annotations, { params });
  }

  public getValidationStats(query: IKerttuSpeciesQuery): Observable<IListResult<IValidationStat>> {
    const path = this.basePath + '/statistics/validations';

    return this.httpClient.get<IListResult<IValidationStat>>(path);
  }

  public getUserStats(personToken?: string): Observable<IListResult<IUserStat>> {
    const path = this.basePath + '/statistics/users';

    return this.httpClient.get<IListResult<IUserStat>>(path);
  }
}
