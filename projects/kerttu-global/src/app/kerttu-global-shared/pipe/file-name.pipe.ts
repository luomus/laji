import { Pipe, PipeTransform } from '@angular/core';
import { IGlobalSpecies } from '../models';

@Pipe({
  name: 'fileName'
})
export class FileNamePipe implements PipeTransform {

  transform(value: string): string;
  transform(value: string[]): string[];
  transform(value: string|string[]): string|string[] {
    if (Array.isArray(value)) {
      return value.map(v => this.transform(v));
    }
    return new URL(value).pathname.split('/').pop()!;
  }

}
