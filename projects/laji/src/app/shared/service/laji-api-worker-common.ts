import { HttpHeaders } from '@angular/common/http';

interface Response {
  headers: HttpHeaders;
  status: number;
  statusText: string;
  url: string;
}

export interface SuccessResponse extends Response {
  body: string;
}

export interface ErrorResponse extends Response {
  error: string;
}

export interface LajiApiWorkerSuccessResponse {
  id: number;
  key: string;
  response: Response;
}

export interface LajiApiWorkerErrorResponse {
  id: number;
  key: string;
  error: Response;
}

export function isErrorResponse(object: any): object is LajiApiWorkerErrorResponse {
  return 'error' in object;
}

export function hasPersonToken(request: any): boolean {
  if (typeof request !== 'object' || request === null) {
    return false;
  }

  const url: string = request.urlWithParams || request.url || '';
  if (url.includes(PERSON_TOKEN)) {
    return true;
  }
  if (request.body && typeof request.body === 'object' && typeof request.url === 'string' && request.url.includes('graphql')) {
    if (request.body.variables && typeof request.body.variables === 'object') {
      const variables = request.body.variables;
      if (Object.values(variables).includes(PERSON_TOKEN)) {
        return  true;
      }
    }
    if (typeof request.body.query === 'string' && request.body.query.includes(PERSON_TOKEN)) {
      return true;
    }
  }
  return false;
}

export const PERSON_TOKEN = '__PERSON_TOKEN___';
export const CLEAR_TOKEN_MSG = '__CLEAR_TOKEN__';
export const REQUEST_MSG = '__REQUEST__';
export const LOGOUT_MSG = '__LOGOUT__';
