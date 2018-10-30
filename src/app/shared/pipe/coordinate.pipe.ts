import { Pipe, PipeTransform } from '@angular/core';

// Singleton cache.
const locationCache = {};

@Pipe({
  name: 'coordinate'
})
export class CoordinatePipe implements PipeTransform {

  transform(value: string, type: string): any {
    if (!value || !type) {
      return '';
    }
    switch (type) {
      case 'ykj':
        return this.makeMinMaxYkj(value);
      case 'euref':
        return this.makeMinMaxCoordinate(value);
      case 'wgs84':
        return this.makeMinMaxCoordinate(value);
      case 'ykj10km':
        return this.joinCoordinate(value);
      case 'ykj10kmCenter':
        return this.joinCoordinate(value);
      case 'ykj1km':
        return this.joinCoordinate(value);
      case 'ykj1kmCenter':
        return this.joinCoordinate(value);
    }
  }

  private getYkjCoord(min, max, minLen = 3) {
    const key = min + ':' + max;
    if (!locationCache[key]) {
      let tmpMin = ('' + min).replace(/[0]*$/, '');
      let tmpMax = ('' + max).replace(/[0]*$/, '');
      const targetLen = Math.max(tmpMin.length, tmpMax.length, minLen);
      tmpMin = tmpMin + '0000000'.substr(tmpMin.length, (targetLen - tmpMin.length));
      tmpMax = '' + (+(tmpMax + '0000000'.substr(tmpMax.length, (targetLen - tmpMax.length))) - 1);
      locationCache[key] = tmpMin === tmpMax ? tmpMin : tmpMin + '-' + tmpMax;
    }
    return locationCache[key];
  }

  private joinCoordinate(value) {
    if (value.lat && value.lon) {
      return `${value.lat}:${value.lon}`;
    }
    return '';
  }

  private makeMinMaxCoordinate(value) {
    if (value.latMax && value.latMin && value.lonMax && value.lonMin) {
      const lat = value.latMax === value.latMin ? value.latMax : value.latMin + '-' + value.latMax;
      const lon = value.lonMax === value.lonMin ? value.lonMax : value.lonMin + '-' + value.lonMax;
      return `${lat} ${lon}`;
    }
    return '';
  }

  private makeMinMaxYkj(value) {
    if (value.latMin) {
      const lat = this.getYkjCoord(value.latMin, value.latMax);
      return lat + ':' + this.getYkjCoord(value.lonMin, value.lonMax, lat.split('-')[0].length);
    }
    return '';
  }

}
