import { Injectable } from '@angular/core';
import LajiForm from 'laji-form/lib/laji-form';
import LajiMap from 'laji-map/lib/map';

@Injectable()
export class LajiExternalService {

  constructor() {
  }

  getForm(options: any): any {
    return new LajiForm(options);
  }

  getMap(options: any) {
    return new LajiMap(options);
  }

}
