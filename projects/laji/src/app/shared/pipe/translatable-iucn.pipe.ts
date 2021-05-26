import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'translatableIucn'
})
export class TranslatableIucnPipe implements PipeTransform {

  transform(value: any): any {
    if (typeof value !== 'string') {
      return value;
    }

    return 'iucn.taxon.' + value;
  }

}
