import { Headers, Http, RequestOptionsArgs, Response, URLSearchParams } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { News, PagedResult } from '../model';
import 'rxjs/Rx';

@Injectable()
export class NewsApi {
  public defaultHeaders: Headers = new Headers();
  protected basePath = '/api';
  private lastResult: PagedResult<News>;

  constructor(protected http: Http) {
  }

  /**
   * return news-list
   *
   * @param lang Language of the news-list. Defaults to en.
   * @param page Page number
   * @param pageSize Page size
   */
  public findAll(lang?: string, page?: string, pageSize?: string): Observable<PagedResult<News>> {
    const path = this.basePath + '/news';

    let queryParameters = new URLSearchParams();
    let headerParams = this.defaultHeaders;
    if (lang !== undefined) {
      queryParameters.set('lang', lang);
    }

    if (page !== undefined) {
      queryParameters.set('page', page);
    }

    if (pageSize !== undefined) {
      queryParameters.set('pageSize', pageSize);
    }

    let requestOptions: RequestOptionsArgs = {
      method: 'GET',
      headers: headerParams,
      search: queryParameters
    };

    return this.http.request(path, requestOptions)
      .map((response: Response) => {
        if (response.status === 204) {
          return undefined;
        } else {
          this.lastResult = response.json();
          return this.lastResult;
        }
      });
  }

  /**
   * return news with the given id
   *
   * @param id id of the taxon
   * @oaram extraHttpRequestParams extra header params
   */
  public findById(id: string): Observable<News> {
    const path = this.basePath + '/news/{id}'
        .replace('{' + 'id' + '}', String(id));

    let queryParameters = new URLSearchParams();
    let headerParams = this.defaultHeaders;
    // verify required parameter 'id' is not null or undefined
    if (id === null || id === undefined) {
      throw new Error('Required parameter id was null or undefined when calling newsFindBySubject.');
    }

    // TODO: this can be removed when finding with id is working again and move from the bootstrap to components
    if (this.lastResult) {
      let item = this.lastResult.results.filter((item) => {
        return item.id === id;
      });
      if (item.length > 0) {
        return Observable.create(observer => {
          observer.next(item[0]);
          observer.complete();
        });
      }
    }

    let requestOptions: RequestOptionsArgs = {
      method: 'GET',
      headers: headerParams,
      search: queryParameters
    };

    return this.http.request(path, requestOptions)
      .map((response: Response) => {
        if (response.status === 204) {
          return undefined;
        } else {
          return response.json();
        }
      });
  }

  /**
   * return tags used in news
   *
   */
  public getTags(): Observable<Array<string>> {
    const path = this.basePath + '/news/tags';

    let queryParameters = new URLSearchParams();
    let headerParams = this.defaultHeaders;
    let requestOptions: RequestOptionsArgs = {
      method: 'GET',
      headers: headerParams,
      search: queryParameters
    };

    return this.http.request(path, requestOptions)
      .map((response: Response) => {
        if (response.status === 204) {
          return undefined;
        } else {
          return response.json();
        }
      });
  }
}
