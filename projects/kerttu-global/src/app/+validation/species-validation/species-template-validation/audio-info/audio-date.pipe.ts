import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IGlobalAudio } from '../../../../kerttu-global-shared/models';

@Pipe({
  name: 'audioDate'
})
export class AudioDatePipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {}

  transform(value: IGlobalAudio): string {
    const formatStringParts = [];
    if (value.day) {
      formatStringParts.push('d');
    }
    if (value.month) {
      formatStringParts.push('MMM');
    }
    if (value.year) {
      formatStringParts.push('yyyy');
    }

    const date = new Date(value.year ?? 2000, value.month - 1 ?? 0, value.day ?? 1, 0, 0, 0, 0);

    return this.datePipe.transform(date, formatStringParts.join(' '));
  }

}
