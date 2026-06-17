import { Injectable } from '@angular/core';
import { SpeciesQuery } from '../../kerttu-global-shared/models';

@Injectable()
export class SpeciesListQueryService {
  public query!: SpeciesQuery;

  constructor() {
    this.setDefaultQuery();
  }

  setDefaultQuery() {
    this.query = { page: 1, onlyUnvalidated: false };
  }
}
