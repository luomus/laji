import { Pipe, PipeTransform } from '@angular/core';
import { IdService } from '../service/id.service';

/**
 * fullUri picker
 * Usage:
 *   value | toFullUri
 */
@Pipe({
  name: 'toFullUri'
})
export class ToFullUriPipe implements PipeTransform {
  transform(value: string): any {
    if (Array.isArray(value)) {
      return value.map(val => this.transform(val));
    }
    return IdService.getUri(value);
  }
}
