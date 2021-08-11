import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from 'projects/laji/src/app/shared/service/user.service';
import { Observable, Subscription } from 'rxjs';
import { KerttuGlobalApi } from '../kerttu-global-shared/service/kerttu-global-api';
import { PagedResult } from 'projects/laji/src/app/shared/model/PagedResult';
import { IKerttuSpeciesQuery, IKerttuSpecies, IKerttuSpeciesFilters } from '../kerttu-global-shared/models';
import { Router } from '@angular/router';
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
  styles: []
})
export class ValidationComponent implements OnInit, OnDestroy {
  speciesQuery: IKerttuSpeciesQuery = { page: 1, onlyUnvalidated: false };
  speciesFilters$: Observable<IKerttuSpeciesFilters>;
  speciesList: PagedResult<IKerttuSpecies> = { results: [], currentPage: 0, total: 0, pageSize: 0 };
  loading = false;

  private speciesListSub: Subscription;

  constructor(
    private userService: UserService,
    private kerttuApi: KerttuGlobalApi,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private cd: ChangeDetectorRef
  ) {
    this.speciesFilters$ = this.kerttuApi.getSpeciesFilters();
  }

  ngOnInit() {
    this.updateSpeciesList();
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
    if (this.speciesListSub) {
      this.speciesListSub.unsubscribe();
    }
    this.loading = true;
    this.speciesListSub = this.userService.isLoggedIn$.pipe(
      switchMap(() => this.kerttuApi.getSpeciesList(this.userService.getToken(), this.speciesQuery))
    ).subscribe(data => {
      this.speciesList = data;
      this.loading = false;
      this.cd.markForCheck();
    });
  }
}
