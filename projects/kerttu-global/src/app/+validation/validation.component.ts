import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from 'projects/laji/src/app/shared/service/user.service';
import { Observable, Subscription } from 'rxjs';
import { KerttuGlobalApi } from '../kerttu-global-shared/service/kerttu-global-api';
import { IGlobalSpeciesQuery, IGlobalSpeciesFilters, IGlobalSpeciesListResult } from '../kerttu-global-shared/models';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { LocalizeRouterService } from 'projects/laji/src/app/locale/localize-router.service';

@Component({
  selector: 'laji-validation',
  template: `
    <laji-species-list
      [(query)]="speciesQuery"
      [filters]="speciesFilters$ | async"
      [speciesList]="speciesList"
      [loading]="loading"
      (taxonSelect)="onTaxonSelect($event)"
      (queryChange)="updateSpeciesList()"
    ></laji-species-list>
  `,
  styles: [`
    :host {
      flex: 1 0 auto;
      display: flex;
      flex-direction: column;
    }
  `]
})
export class ValidationComponent implements OnInit, OnDestroy {
  speciesQuery: IGlobalSpeciesQuery = { page: 1, onlyUnvalidated: false };
  speciesFilters$: Observable<IGlobalSpeciesFilters>;
  speciesList: IGlobalSpeciesListResult = { results: [], currentPage: 0, total: 0, pageSize: 0 };
  loading = false;

  private speciesListSub: Subscription;

  constructor(
    private userService: UserService,
    private kerttuGlobalApi: KerttuGlobalApi,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) {
    this.speciesFilters$ = this.kerttuGlobalApi.getSpeciesFilters();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.speciesQuery = {
        onlyUnvalidated: params['onlyUnvalidated'] === 'true',
        continent: this.toInteger(params['continent']),
        order: this.toInteger(params['order']),
        family: this.toInteger(params['family']),
        searchQuery: params['searchQuery'],
        page: this.toInteger(params['page']),
        orderBy: params['orderBy'] ? (Array.isArray(params['orderBy']) ? params['orderBy'] : [params['orderBy']]) : undefined
      };
      this.loadSpeciesList();
    });
  }

  ngOnDestroy() {
    if (this.speciesListSub) {
      this.speciesListSub.unsubscribe();
    }
  }

  onTaxonSelect(taxon: number) {
    this.router.navigate(this.localizeRouterService.translateRoute(['validation', taxon]));
  }

  updateSpeciesList() {
    this.router.navigate(
      [],
      {queryParams: this.speciesQuery}
    );
  }

  private loadSpeciesList() {
    if (this.speciesListSub) {
      this.speciesListSub.unsubscribe();
    }
    this.loading = true;
    this.speciesListSub = this.userService.isLoggedIn$.pipe(
      switchMap(() => this.kerttuGlobalApi.getSpeciesList(this.userService.getToken(), this.speciesQuery))
    ).subscribe(data => {
      this.speciesList = data;
      this.loading = false;
      this.cd.markForCheck();
    });
  }

  private toInteger(value?: string) {
    const intValue = parseInt(value, 10);
    if (!isNaN(intValue)) {
      return intValue;
    }
  }
}
