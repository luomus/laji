import { Pipe, PipeTransform } from '@angular/core';
import { LabelService } from '../label.service';

/**
 * @internal
 */
@Pipe({
    name: 'hasValue',
    standalone: false
})
export class HasValuePipe implements PipeTransform {

  transform(value: any): boolean {
    return LabelService.hasValue(value);
  }

}
