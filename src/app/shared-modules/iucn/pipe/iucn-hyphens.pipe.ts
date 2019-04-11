import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'iucnHyphens'
})
export class IucnHyphensPipe implements PipeTransform {

  private map = {
    'Silmälläpidettävät': 'Silmällä&shy;pidettävät',
    'Arviointiin soveltumattomat': 'Arviointiin soveltu&shy;mattomat',
    'Elinvoimaiset': 'Elinvoi&shy;maiset'
  };

  transform(value: any, args?: any): any {
    return this.map[value] || value;
  }

}
