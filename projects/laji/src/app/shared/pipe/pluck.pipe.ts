import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pluck'
})
export class PluckPipe implements PipeTransform {

  transform<T extends any, K extends keyof T>(value: T|T[], key: K): T[K] | Array<T[K]>;
  transform<T extends {[key in K]: undefined}|Array<{[key in K]: undefined}>, K extends keyof T>(value: T|T[], key: K): undefined | Array<undefined>;
  transform<T extends any, K extends keyof T>(value: T|T[], key: K): T[K] | Array<T[K] | undefined> | undefined {
    if (Array.isArray(value)) {
      return value.map(v => v?.[key]);
    }
    return value?.[key];
  }

}
