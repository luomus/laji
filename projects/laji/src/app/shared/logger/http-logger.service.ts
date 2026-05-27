import { ILogger } from './logger.interface';
import { Injectable } from '@angular/core';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';
import type { operations } from 'projects/laji-api-client/generated/api.d';
type LogLevel = operations['LoggerController_log']['parameters']['path']['level'];

@Injectable()
export class HttpLogger implements ILogger {

  constructor(private api: LajiApiClientService) {
  }

  public error(message: string, meta?: any): void {
    this._log('error', message, meta);
  }

  public info(message: string, meta?: any): void {
    this._log('info', message, meta);
  }

  public warn(message: string, meta?: any): void {
    this._log('warn', message, meta);
  }

  public log(message: string, meta?: any): void {
    // log level items are not send forward
  }

  private _log(level: LogLevel, message: string, meta?: any): void {
    this.api.post(`/logger/{level}`, { path: { level } }, { message, meta }).subscribe();
  }
}
