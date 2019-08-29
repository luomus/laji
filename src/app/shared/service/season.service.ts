import { Injectable } from '@angular/core';
import * as moment from 'moment';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

@Injectable({providedIn: 'root'})
export class SeasonService {
  getCurrentSeason(): Season {
    switch (moment().quarter()) {
      default: return 'spring';
      case 1: return 'spring';
      case 2: return 'summer';
      case 3: return 'autumn';
      case 4: return 'winter';
    }
  }
}
