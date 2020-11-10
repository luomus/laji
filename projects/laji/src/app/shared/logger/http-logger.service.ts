import { ILogger } from './logger.interface';
import { LoggerApi } from '../api/LoggerApi';
import { Injectable } from '@angular/core';

@Injectable()
export class HttpLogger implements ILogger {

  constructor(private loggerApi: LoggerApi) {
  }

  public error(message: string, meta?: any): void {
    this._log('logError', message, meta);
  }

  public info(message: string, meta?: any): void {
    this._log('logInfo', message, meta);
  }

  public warn(message: string, meta?: any): void {
    this._log('logWarn', message, meta);
  }

  public log(message: string, meta?: any): void {
    // log level items are not send forward
  }

  private _log(type: Exclude<keyof LoggerApi, 'logStatus' | 'http'>, message: string, meta?: any): void {
    this.loggerApi[type]({message, meta}).subscribe();
  }
}
