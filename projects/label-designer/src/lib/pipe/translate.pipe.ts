import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '../translate/translate.service';

/**
 * @internal
 */
@Pipe({
  name: 'translate'
})
export class TranslatePipe implements PipeTransform {

  constructor(
    private translateService: TranslateService
  ) { }

  transform(value: any, args?: Record<string, any>): string {
    return this.translateService.get(value, args);
  }

}
