import { Pipe, PipeTransform } from '@angular/core';

export type TypeGuard<T> = (a: any) => a is T;

@Pipe({
  name: 'typeGuard'
})
export class TypeGuardPipe implements PipeTransform {

 transform<T>(value: any, typeGuard: TypeGuard<T>): T | undefined {
    return typeGuard(value) ? value : undefined;
  }

}
