import { Pipe, PipeTransform } from '@angular/core';
import { ISelectFields } from './select-fields/select-fields.component';

@Pipe({
  name: 'removeByList'
})
export class RemoveByListPipe implements PipeTransform {

  transform(value: ISelectFields[], args: ISelectFields[]): any {
    return value.filter(item => args.findIndex(i => i.key === item.key) === -1);
  }

}
