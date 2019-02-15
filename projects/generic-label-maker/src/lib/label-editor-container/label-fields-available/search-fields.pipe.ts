import { Pipe, PipeTransform } from '@angular/core';
import { LabelField } from '../../generic-label-maker.interface';

@Pipe({
  name: 'searchFields'
})
export class SearchFieldsPipe implements PipeTransform {

  transform(value: LabelField[], args?: string): any {
    if (!args) {
      return value;
    }
    const upperSearch = args.toLocaleLowerCase();
    return value.filter(val => val.label.toLocaleLowerCase().indexOf(upperSearch) !== -1);
  }

}
