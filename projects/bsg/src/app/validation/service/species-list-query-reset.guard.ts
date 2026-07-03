import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SpeciesListQueryService } from './species-list-query.service';

@Injectable()
export class SpeciesListQueryResetGuard  {
  constructor(
    private queryService: SpeciesListQueryService
  ) {}

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    this.queryService.setDefaultQuery();
    return true;
  }
}
