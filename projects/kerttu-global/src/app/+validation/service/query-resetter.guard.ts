import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { SpeciesListQueryService } from './species-list-query.service';

@Injectable()
export class QueryResetterGuard implements CanActivate {
  constructor(
    private queryService: SpeciesListQueryService
  ) {}

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    this.queryService.setDefaultQuery();
    return true;
  }
}
