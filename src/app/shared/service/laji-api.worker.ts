/// <reference lib="webworker" />
import { ajax } from 'rxjs/ajax';
import { catchError, map, mergeMap, share, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
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
      map(d => d['token'] || ''),
      tap(t => personToken = '' +  t),
      tap(t => { if (!t) { postMessage({type: LOGOUT_MSG}); } }),
      share()
    );
  }
  return token$;
}

function replaceToken(token: string, request: any): any {
  if (typeof request.url === 'string') {
    request.url = request.url.replace(PERSON_TOKEN, personToken);
  }
  if (request.body && typeof request.body === 'object' && typeof request.url === 'string' && request.url.includes('graphql')) {
    const personTokenReqExp = new RegExp(PERSON_TOKEN, 'gm');
    if (request.body.variables) {
      const variables = request.body.variables;
      request.body.variables = Object.keys(variables).reduce((result, key) => {
        if (typeof variables[key] === 'string') {
          result[key] = variables[key].replace(personTokenReqExp, personToken);
        } else {
          result[key] = variables[key];
        }
        return result;
      }, {});
    }
    if (typeof request.body.query === 'string') {
      request.body.query = request.body.query.replace(personTokenReqExp, personToken);
    }
  }
  return request;
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
    if (data.loginUrl.startsWith('https://fmnh-ws-test.it.helsinki.fi/laji-auth/') || data.loginUrl.startsWith('https://login.laji.fi/')) {
      loginUrl = data.loginUrl;
    }
  }
  if (localKey !== key || !loginUrl) {
    postMessage({type: LOGOUT_MSG});
    return;
  }
  if (!id) {
    return;
  }

  fetchPersonToken().pipe(
    mergeMap(token => ajax(hasPersonToken(request) ? replaceToken(token, request) : request)),
    map(res => ({
      body: res.response,
      headers: {},
      status: res.status,
      statusText: '' + res.status,
      url: request.url,
    } as SuccessResponse)),
    catchError(err => of({
      error: err.error || err.body,
      headers: {},
      status: err.status,
      statusText: '' + err.status,
      url: err.url,
    } as ErrorResponse))
  ).subscribe((res) => 'error' in res ?
    postMessage({type: REQUEST_MSG, id, error: res}) :
    postMessage({type: REQUEST_MSG, id, response: res})
  );
});
