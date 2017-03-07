import { Injectable } from '@angular/core';
import LajiForm from 'laji-form/lib/laji-form'; // Keep the order!
import LajiMap from 'laji-map/lib/map'; // this has to be after laji-form!

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