import { Pipe, PipeTransform } from '@angular/core';
import { MultiLangService } from '../service/multi-lang.service';

@Pipe({
  name: 'multiLangRows',
  pure: true
})
export class MultiLangRowsPipe implements PipeTransform {
  public value = [];

  transform(value: any): string[] {
    if (typeof value === 'string' || typeof value !== 'object') {
      return [value];
    }

    return MultiLangService.valuesToArray(value);    
  }
}
