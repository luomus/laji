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

export const PERSON_TOKEN = '__TOKEN___';
export const CLEAR_TOKEN_MSG = '__CLEAR_TOKEN__';
export const REQUEST_MSG = '__REQUEST__';
export const LOGOUT_MSG = '__LOGOUT__';
