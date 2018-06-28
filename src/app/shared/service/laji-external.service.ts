import { Injectable } from '@angular/core';
import LajiMap from 'laji-map/lib/map';

@Injectable({providedIn: 'root'})
export class LajiExternalService {

  constructor() {
  }

  getMap(options: any) {
    return new LajiMap(options);
  }

}
