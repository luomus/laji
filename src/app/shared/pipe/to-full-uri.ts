import { Pipe, PipeTransform } from '@angular/core';
import { IdService } from '../service/id.service';

/**
 * fullUri picker
 * Usage:
 *   value | toFullUri
 */
@Pipe({
  name: 'toFullUri',
  pure: false
})
export class ToFullUriPipe implements PipeTransform {
  transform(value: string): any {
    return IdService.getUri(value);
  }
}
