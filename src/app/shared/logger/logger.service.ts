import { ILogger } from './logger.interface';
import { Injectable } from '@angular/core';

// Declare the console as an ambient value so that TypeScript doesn't complain.
declare const console: any;

@Injectable()
export class Logger implements ILogger {

  public error(message: string, meta?: any): void {
  }

  public warn(message: string, meta?: any): void {
  }

  public info(message: string, meta?: any): void {
  }

  public log(message: string, meta?: any): void {
  }
}
