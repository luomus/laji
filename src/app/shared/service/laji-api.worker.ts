/// <reference lib="webworker" />
import { ajax } from 'rxjs/ajax';
import { HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

interface Response {
  headers: HttpHeaders;
  status: number;
  statusText: string;
  url: string;
}

interface SuccessResponse extends Response {
  body: string;
}

interface ErrorResponse extends Response {
  error: string;
}

export interface LajiApiWorkerSuccessResponse {
  id: number;
  key: string;
  response: Response
}

export interface LajiApiWorkerErrorResponse {
  id: number;
  key: string;
  error: Response
}

export function isErrorResponse(object: any): object is LajiApiWorkerErrorResponse {
  return 'error' in object;
}

export const REQUEST_MSG = '__REQUEST__';
export const LOGOUT_MSG = '__LOGOUT__';
export const PERSON_TOKEN = '__TOKEN___';

let loginUrl = '';
let localKey = '';
let personToken = '';

function fetchPersonToken() {

}

addEventListener('message', ({ data }) => {
  const {id, key, request} = data;
  if (!key) {
    return;
  } else if (!localKey) {
    localKey = key;
    if (!(data.loginUrl.startsWith('https://fmnh-ws-test.it.helsinki.fi/laji-auth/') || data.loginUrl.startsWith('https://login.laji.fi/'))) {
      loginUrl = data.loginUrl;
    }
  }
  if (localKey !== key) {
    postMessage({type: LOGOUT_MSG});
    return;
  }
  if (!id) {
    return;
  }

  // TODO: find a way to get the person token here

  ajax(request).pipe(
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
