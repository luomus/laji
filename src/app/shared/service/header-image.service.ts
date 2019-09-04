import { Injectable } from '@angular/core';
import * as moment from 'moment';

export interface HeaderImage {
  imageUrl: string;
  attribution: string;
  attributionUrl: string;
  license: string;
  licenseUrl: string;
}

const headerImages = {
  'spring': {
    imageUrl: 'https://cdn.laji.fi/images/backdrop/spring_1.jpg',
    attribution: 'Mikko Heikkinen',
    attributionUrl: 'https://www.biomi.org/',
    license: 'Creative Commons BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/'
  },
  'summer': {
    imageUrl: 'https://cdn.laji.fi/images/backdrop/spring_1.jpg',
    attribution: 'Mikko Heikkinen',
    attributionUrl: 'https://www.biomi.org/',
    license: 'Creative Commons BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/'
  },
  'autumn': {
    imageUrl: 'https://cdn.laji.fi/images/backdrop/syksy2.jpg',
    attribution: 'Kari Lahti',
    attributionUrl: '',
    license: 'Creative Commons BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/'
  },
  'winter': {
    imageUrl: 'https://cdn.laji.fi/images/backdrop/syksy2.jpg',
    attribution: 'Timo Newton-Syms',
    attributionUrl: 'https://www.flickr.com/photos/timo_w2s/15517459434/',
    license: 'Creative Commons BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/'
  },
};

@Injectable({providedIn: 'root'})
export class HeaderImageService {
  getCurrentSeason(): HeaderImage {
    switch (moment().quarter()) {
      default:  return headerImages['spring'];
      case 1:   return headerImages['spring'];
      case 2:   return headerImages['summer'];
      case 3:   return headerImages['autumn'];
      case 4:   return headerImages['winter'];
    }
  }
}
