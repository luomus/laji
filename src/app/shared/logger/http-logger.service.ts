import { ILogger } from './logger.interface';
import { LoggerApi } from '../api/LoggerApi';

export class HttpLogger implements ILogger {

  constructor(private loggerApi: LoggerApi) {
  }

  public error(message: string, meta?: any): void {
    this.loggerApi.logError({message: message, meta}).subscribe();
  }

  public info(message: string, meta?: any): void {
    this.loggerApi.logInfo({message: message, meta}).subscribe();
  }

  public warn(message: string, meta?: any): void {
    this.loggerApi.logWarn({message: message, meta}).subscribe();
  }

  public log(message: string, meta?: any): void {
    // log level items are not send forward
  }
}
