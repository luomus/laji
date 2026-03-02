import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'dateCutoffFuture',
    standalone: false
})
export class DateCutoffFuturePipe implements PipeTransform {

  transform(value: any): any {
    let date = new Date(value);
    const now = new Date();
    if (date > now) {
      date = now;
    }
    return date;
  }

}
