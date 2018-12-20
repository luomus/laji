import { Injectable } from '@angular/core';
import { Setup } from './generic-label-maker.interface';

@Injectable({
  providedIn: 'root'
})
export class GenericLabelMakerService {

  public static EmptySetup: Setup = {
    page: {
      height: 297,
      width: 210,
      margin: {
        top: 10,
        left: 10
      }
    },
    label: {
      height: 20,
      width: 50,
      margin: {
        top: 3,
        left: 3
      }
    },
    labelItems: []
  };

  constructor() { }
}
