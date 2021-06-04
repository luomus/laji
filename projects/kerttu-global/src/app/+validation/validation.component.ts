import { ChangeDetectorRef, Component } from '@angular/core';
import { UserService } from 'projects/laji/src/app/shared/service/user.service';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { KerttuGlobalApi } from '../kerttu-global-shared/service/kerttu-global-api';
import { PagedResult } from 'projects/laji/src/app/shared/model/PagedResult';
import { IKerttuSpeciesQuery, IKerttuSpecies, IKerttuSpeciesFilters, IKerttuRecording } from '../kerttu-global-shared/models';

@Component({
  selector: 'laji-validation',
  template: `
    <laji-species-list
      *ngIf="!taxon"
      [(query)]="speciesQuery"
      [filters]="speciesFilters$ | async"
      [speciesList]="speciesList"
      [loading]="loading"
      (taxonSelect)="onTaxonSelect($event)"
      (queryChange)="updateSpeciesList()"
    ></laji-species-list>
    <laji-species-validation
      *ngIf="taxon"
      [data]="validationData$ | async"
      (annotationsReady)="annotationsReady($event)"
      [saving]="saving"
    ></laji-species-validation>
  `,
  styles: []
})
export class ValidationComponent {
  speciesQuery: IKerttuSpeciesQuery = { page: 1, onlyUnvalidated: false };
  speciesFilters$: Observable<IKerttuSpeciesFilters>;
  speciesList: PagedResult<IKerttuSpecies> = {results: [], currentPage: 0, total: 0, pageSize: 0};
  loading = false;

  taxon?: number;
  validationData$?: Observable<IKerttuRecording[]>;
  saving = false;

  private speciesListSub: Subscription;

  constructor(
    private userService: UserService,
    private kerttuApi: KerttuGlobalApi,
    private cd: ChangeDetectorRef
  ) {
    this.speciesFilters$ = this.kerttuApi.getSpeciesFilters();
    this.updateSpeciesList();
  }

  onTaxonSelect(taxon: number) {
    this.taxon = taxon;
    this.validationData$ = this.kerttuApi.getDataForValidation(this.taxon).pipe(map(data => data.results));
  }

  updateSpeciesList() {
    if (this.speciesListSub) {
      this.speciesListSub.unsubscribe();
    }
    this.loading = true;
    this.speciesListSub = this.kerttuApi.getSpeciesList(this.userService.getToken(), this.speciesQuery).subscribe(data => {
      this.speciesList = data;
      this.loading = false;
      this.cd.markForCheck();
    });
  }

  annotationsReady(annotations) {
    this.saving = true;
    this.kerttuApi.saveAnnotations(this.userService.getToken(), this.taxon, annotations).subscribe(() => {
      this.taxon = undefined;
      this.validationData$ = undefined;
      this.saving = false;
      this.cd.markForCheck();
    });
  }
}
