import { Pipe, PipeTransform } from '@angular/core';
import { LabelService } from '../label.service';

@Pipe({
  name: 'hasValue'
})
export class HasValuePipe implements PipeTransform {

  transform(value: any): boolean {
    return LabelService.hasValue(value);
  }

}
