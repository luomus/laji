import { Injectable } from '@angular/core';
import { IGlobalSpeciesQuery } from '../../kerttu-global-shared/models';

@Injectable()
export class SpeciesListQueryService {
  public query!: IGlobalSpeciesQuery;

  constructor() {
    this.setDefaultQuery();
  }

  setDefaultQuery() {
    this.query = { page: 1, onlyUnvalidated: false };
  }
}
