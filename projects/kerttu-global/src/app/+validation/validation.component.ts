import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { UserService } from 'projects/laji/src/app/shared/service/user.service';
import { Observable, Subscription } from 'rxjs';
import { KerttuGlobalApi } from '../kerttu-global-shared/service/kerttu-global-api';
import { IGlobalSpeciesFilters, IGlobalSpeciesListResult } from '../kerttu-global-shared/models';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { LocalizeRouterService } from 'projects/laji/src/app/locale/localize-router.service';
import { SpeciesListQueryService } from './service/species-list-query.service';

@Component({
  selector: 'laji-validation',
  template: `
    <laji-species-list
      [(query)]="queryService.query"
      [filters]="speciesFilters$ | async"
      [speciesList]="speciesList"
      [loading]="loading"
      (speciesSelect)="onSpeciesSelect($event)"
      (queryChange)="updateSpeciesList()"
    ></laji-species-list>
  `,
  styles: [`
    :host {
      flex: 1 0 auto;
      display: flex;
      flex-direction: column;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationComponent implements OnInit, OnDestroy {
  speciesFilters$: Observable<IGlobalSpeciesFilters>;
  speciesList: IGlobalSpeciesListResult = { results: [], currentPage: 0, total: 0, pageSize: 0 };
  loading = false;

  private speciesListSub: Subscription;

  constructor(
    public queryService: SpeciesListQueryService,
    private userService: UserService,
    private kerttuGlobalApi: KerttuGlobalApi,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private cd: ChangeDetectorRef
  ) {
    this.speciesFilters$ = this.kerttuGlobalApi.getSpeciesFilters();
  }

  ngOnInit() {
    this.updateSpeciesList();
  }

  ngOnDestroy() {
    if (this.speciesListSub) {
      this.speciesListSub.unsubscribe();
    }
  }

  onSpeciesSelect(speciesId: number) {
    this.router.navigate(this.localizeRouterService.translateRoute(['validation', speciesId]));
  }

  updateSpeciesList() {
    if (this.speciesListSub) {
      this.speciesListSub.unsubscribe();
    }
    this.loading = true;
    this.speciesListSub = this.userService.isLoggedIn$.pipe(
      switchMap(() => this.kerttuGlobalApi.getSpeciesList(this.userService.getToken(), this.queryService.query))
    ).subscribe(data => {
      this.speciesList = data;
      this.loading = false;
      this.cd.markForCheck();
    });
  }
}
