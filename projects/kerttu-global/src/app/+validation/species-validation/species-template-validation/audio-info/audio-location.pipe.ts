import { Pipe, PipeTransform } from '@angular/core';
import { IGlobalAudio } from '../../../../kerttu-global-shared/models';

@Pipe({
  name: 'audioLocation'
})
export class AudioLocationPipe implements PipeTransform {
  constructor() {}

  transform(value: IGlobalAudio): string {
    const locations = [];
    if (value.location) {
      locations.push(value.location);
    }
    if (value.state) {
      locations.push(value.state);
    }
    if (value.country) {
      locations.push(value.country);
    }
    return locations.join(', ');
  }

}
