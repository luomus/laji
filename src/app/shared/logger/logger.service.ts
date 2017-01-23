import { ILogger } from './logger.interface';
import { Injectable } from '@angular/core';

// Declare the console as an ambient value so that TypeScript doesn't complain.
declare const console: any;

@Injectable()
export abstract class Logger implements ILogger {

  abstract error(message: string, meta?: any): void;

  abstract warn(message: string, meta?: any): void;

  abstract info(message: string, meta?: any): void;

  abstract log(message: string, meta?: any): void;
}
