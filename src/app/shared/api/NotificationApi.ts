import { Headers, Http, RequestOptionsArgs, Response, URLSearchParams } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Notification } from '../model/Notification';
import { PagedResult } from '../model/PagedResult';

/* tslint:disable:no-unused-variable member-ordering */

@Injectable()
export class NotificationApi {
  protected basePath = '/api';
  public defaultHeaders: Headers = new Headers({'Content-Type': 'application/json'});

  constructor(protected http: Http) {
  }

  public fetch(personToken: string, page?: string, pageSize?: string, onlyUnSeen?: string, extraHttpRequestParams?: any ): Observable<PagedResult<Notification>> {
    const path = this.basePath + `/notifications`;

    const queryParameters = new URLSearchParams();
    const headerParams = this.defaultHeaders;
    if (personToken === null || personToken === undefined) {
      throw new Error('Required parameter personToken was null or undefined when calling documentCreateWithUser.');
    }
    queryParameters.set('personToken', personToken);

    if (page !== undefined) {
      queryParameters.set('page', page);
    }

    if (pageSize !== undefined) {
      queryParameters.set('pageSize', pageSize);
    }

    if (onlyUnSeen !== undefined) {
      queryParameters.set('onlyUnSeen', onlyUnSeen);
    }

    const requestOptions: RequestOptionsArgs = {
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

  public update(notification: Notification, personToken: string, extraHttpRequestParams?: any ): Observable<Notification> {
    const path = this.basePath + `/notifications/${notification.id}`;

    const queryParameters = new URLSearchParams();
    const headerParams = this.defaultHeaders;
    if (personToken === null || personToken === undefined) {
      throw new Error('Required parameter personToken was null or undefined when calling documentCreateWithUser.');
    }
    queryParameters.set('personToken', personToken);

    const requestOptions: RequestOptionsArgs = {
      method: 'PUT',
      headers: headerParams,
      search: queryParameters
    };
    requestOptions.body = JSON.stringify(notification);

    return this.http.request(path, requestOptions)
      .map((response: Response) => {
        if (response.status === 204) {
          return undefined;
        } else {
          return response.json();
        }
      });
  }

  public delete(id: string, personToken: string, extraHttpRequestParams?: any ): Observable<any> {
    const path = this.basePath + `/notifications/${id}`;

    const queryParameters = new URLSearchParams();
    const headerParams = this.defaultHeaders;
    if (personToken === null || personToken === undefined) {
      throw new Error('Required parameter personToken was null or undefined when calling documentCreateWithUser.');
    }
    queryParameters.set('personToken', personToken);

    const requestOptions: RequestOptionsArgs = {
      method: 'DELETE',
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
