import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ValidationAudio } from '../../../../bsg-shared/models';

@Pipe({
    name: 'audioDate',
    standalone: false
})
export class AudioDatePipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {}

  transform(value: ValidationAudio): string {
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

    const date = new Date(value.year ?? 2000, (value.month ?? 1) - 1, value.day ?? 1, 0, 0, 0, 0);

    return this.datePipe.transform(date, formatStringParts.join(' '))!;
  }

}
