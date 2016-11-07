import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class LajiErrorHandler implements ErrorHandler {

  constructor() {}

  handleError(error) {
    console.log(error);
  }
}