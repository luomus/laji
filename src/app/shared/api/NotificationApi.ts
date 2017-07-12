import { Headers, Http, RequestOptionsArgs, Response, URLSearchParams } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Notification } from '../model/Notification';

/* tslint:disable:no-unused-variable member-ordering */

@Injectable()
export class NotificationApi {
  protected basePath = '/api';
  public defaultHeaders: Headers = new Headers({'Content-Type': 'application/json'});

  constructor(protected http: Http) {
  }

  public fetch(personToken: string, extraHttpRequestParams?: any ): Observable<Notification[]> {
    const path = this.basePath + `/notifications`;

    const queryParameters = new URLSearchParams();
    const headerParams = this.defaultHeaders;
    if (personToken === null || personToken === undefined) {
      throw new Error('Required parameter personToken was null or undefined when calling documentCreateWithUser.');
    }
    queryParameters.set('personToken', personToken);

    const requestOptions: RequestOptionsArgs = {
      method: 'GET',
      headers: headerParams,
      search: queryParameters
    };

    return Observable.of([]);
/*
    return Observable.of([
      {
        id: 'SD.21',
        annotationID: 'MAN.134',
        seen: false,
        created: '2016-01-01 12:01:20'
      },
      {
        id: 'SD.22',
        annotationID: 'MAN.126',
        seen: true,
        created: '2016-01-01 12:01:20'
      }
    ]).delay(2000);
    */
/*
    return this.http.request(path, requestOptions)
      .map((response: Response) => {
        if (response.status === 204) {
          return undefined;
        } else {
          return response.json();
        }
      });
*/
  }

  public markAsSeen(id: Notification, personToken: string, extraHttpRequestParams?: any ): Observable<Notification> {
    const path = this.basePath + `/notifications/${id}`;

    const queryParameters = new URLSearchParams();
    const headerParams = this.defaultHeaders;
    if (personToken === null || personToken === undefined) {
      throw new Error('Required parameter personToken was null or undefined when calling documentCreateWithUser.');
    }
    queryParameters.set('personToken', personToken);

    const requestOptions: RequestOptionsArgs = {
      method: 'POST',
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

  public delete(id: Notification, personToken: string, extraHttpRequestParams?: any ): Observable<Notification> {
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
