/// <reference lib="webworker" />
import { ajax } from 'rxjs/ajax';
import { catchError, map, mergeMap, share, switchMap } from 'rxjs/operators';
import { from, Observable, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

import {
  CLEAR_TOKEN_MSG,
  ErrorResponse,
  hasPersonToken,
  LOGOUT_MSG,
  PERSON_TOKEN,
  REQUEST_MSG,
  SuccessResponse
} from './laji-api-worker-common';

let loginUrl = '';
let localKey = '';
let personToken = '';

let token$: Observable<string>;

function fetchPersonToken(): Observable<string> {
  if (personToken || !loginUrl) {
    return of(personToken);
  }
  if (!token$) {
    token$ = ajax({
      url: loginUrl,
      withCredentials: true
    }).pipe(
      map(r => r.response),
      switchMap(d => {
        personToken = d['token'];

        return personToken ? of(personToken) : throwError({
          error: {message: 'Failed to verify user'},
          url: loginUrl,
          status: d['error'] && d['error'] === 404 ? 404 : 0
        });
      }),
      share()
    );
  }
  return token$;
}

function convertToken(data: string, replace: string, to: string) {
  if (typeof data === 'string') {
    const rep = new RegExp(replace, 'gm');
    return data.replace(rep, to);
  }
  return data;
}

function replaceToken(token: string, request: any): any {
  if (typeof request.url === 'string') {
    request.url = convertToken(request.url, PERSON_TOKEN, personToken);
  }
  if (request.body && typeof request.body === 'object' && typeof request.url === 'string' && request.url.indexOf('graphql') !== -1) {
    if (request.body.variables) {
      const variables = request.body.variables;
      request.body.variables = Object.keys(variables).reduce((result, key) => {
        if (typeof variables[key] === 'string') {
          result[key] = convertToken(variables[key], PERSON_TOKEN, personToken);
        } else {
          result[key] = variables[key];
        }
        return result;
      }, {});
    }
    if (typeof request.body.query === 'string') {
      request.body.query = convertToken(request.body.query, PERSON_TOKEN, personToken);
    }
  }
  return request;
}

function dataUrlToBlob(dataURL: string): Blob {
  const BASE64_MARKER = ';base64,';
  if (dataURL.indexOf(BASE64_MARKER) === -1) {
    const items = dataURL.split(',');
    const type = items[0].split(':')[1];

    return new Blob([decodeURIComponent(items[1])], {type});
  }

  const parts = dataURL.split(BASE64_MARKER);
  const contentType = parts[0].split(':')[1];
  const raw = atob(parts[1]);
  const rawLength = raw.length;

  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], {type: contentType});
}

function isOkResponse(res: {status: number}) {
  return res?.status >= 200 && res?.status < 300;
}

function prepareResponse(t: string): any {
  if (typeof t === 'string') {
    if (personToken) {
      t = convertToken(t, personToken, PERSON_TOKEN);
    }
    try {
      return JSON.parse(t);
    } catch (e) {}
  }
  return t;
}

function makeRequest({url, ...request}: any): Observable<any> {
  if (request.dataUrls) {
    const formData = new FormData();
    request.dataUrls.forEach((d, idx) => formData.append('data' + idx, dataUrlToBlob(d.content), d.filename));
    request.body = formData;
    delete request.dataUrls;
    delete request.headers;
  } else if (request.body && typeof request.body !== 'string') {
    request.body = JSON.stringify(request.body);
  }
  return from(fetch(url, {
    ...request
  }).then(r => {
    if (r.status === 204) {
      return {
        response: '',
        headers: {},
        status: r.status,
        statusText: r.statusText,
        url,
      };
    }
    return r.text().then(j => ({
      response: prepareResponse(j),
      headers: {},
      status: r.status,
      statusText: r.statusText,
      url,
    }));
  }));
}

addEventListener('message', ({ data }) => {
  const {id, key, type, request} = data;
  if (!key) {
    return;
  } else if (type === CLEAR_TOKEN_MSG) {
    personToken = '';
    return;
  } else if (!localKey) {
    localKey = key;
    if (data.loginUrl.indexOf(environment.loginCheck) === 0) {
      loginUrl = data.loginUrl;
    }
  }
  if (localKey !== key || !loginUrl) {
    postMessage({type: LOGOUT_MSG});
    return;
  }
  if (!id || !request || !request.url || !(request.url.indexOf(environment.apiBase) === 0 || request.url.indexOf(environment.kerttuApi) === 0)) {
    return;
  }

  fetchPersonToken().pipe(
    map((token) => hasPersonToken(request) ? replaceToken(token, request) : request),
    mergeMap(req => makeRequest(req)),
    map(res => (res.status < 400 ? {
      body: res.response,
      headers: {},
      status: res.status,
      statusText: '' + res.status,
      url: convertToken(request.url, personToken, PERSON_TOKEN),
    } as SuccessResponse : {
      error: res.response?.error || res.response,
      headers: {},
      status: res.status,
      statusText: '' + res.status,
      url: convertToken(request.url, personToken, PERSON_TOKEN),
    } as ErrorResponse)),
    catchError((err) => typeof err.status !== 'undefined' ? of(err) : of({
      status: 500,
      statusText: '500',
      headers: {},
      error: err.message,
      url: convertToken(request.url, personToken, PERSON_TOKEN),
    } as ErrorResponse)),
  ).subscribe((res) => {
    if (isOkResponse(res)) {
      postMessage({type: REQUEST_MSG, id, response: res});
    } else {
      postMessage({type: REQUEST_MSG, id, error: res});
    }
  });
});
