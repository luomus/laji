import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'collectionLang'
})
export class CollectionLangPipe implements PipeTransform {
  collectionLangs = ['finnish', 'english', 'swedish', 'mixed'];

  transform(value: any, args?: any): any {
    if (this.collectionLangs.includes(value)) {
      return 'lang.' + value;
    }
    return value;
  }

}
