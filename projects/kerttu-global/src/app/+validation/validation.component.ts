import { ChangeDetectorRef, Component } from '@angular/core';
import { UserService } from 'projects/laji/src/app/shared/service/user.service';
import { Observable, Subscription } from 'rxjs';
import { KerttuGlobalApi } from '../kerttu-global-shared/service/kerttu-global-api';
import { PagedResult } from 'projects/laji/src/app/shared/model/PagedResult';
import { IKerttuTaxon } from '../kerttu-global-shared/models';

@Component({
  selector: 'laji-validation',
  template: `
    <laji-species-list *ngIf="!taxon" [speciesList]="speciesList" [loading]="loading" (taxonSelect)="onTaxonSelect($event)" (pageChange)="onSpeciesPageChange($event)"></laji-species-list>
    <laji-species-validation *ngIf="taxon" [taxon]="taxon" [data]="validationData$ | async" (annotationsReady)="annotationsReady($event)" [saving]="saving"></laji-species-validation>
  `,
  styles: []
})
export class ValidationComponent {
  speciesList: PagedResult<IKerttuTaxon> = {results: [], currentPage: 0, total: 0, pageSize: 0};
  loading = false;

  taxon: string;
  validationData$: Observable<any[]>;
  saving = false;

  private speciesListSub: Subscription;

  constructor(
    private userService: UserService,
    private kerttuApi: KerttuGlobalApi,
    private cd: ChangeDetectorRef
  ) {
    this.onSpeciesPageChange(1);
    // this.onTaxonSelect('MX.26282');
  }

  onTaxonSelect(taxon: string) {
    this.taxon = taxon;
    this.validationData$ = this.kerttuApi.getDataForValidation(this.taxon);
  }

  onSpeciesPageChange(page: number) {
    if (this.speciesListSub) {
      this.speciesListSub.unsubscribe();
    }
    this.loading = true;
    this.speciesListSub = this.kerttuApi.getSpeciesList(this.userService.getToken(), page).subscribe(data => {
      this.speciesList = data;
      this.loading = false;
      this.cd.markForCheck();
    });
  }

  annotationsReady(annotations) {
    this.saving = true;
    this.kerttuApi.saveAnnotations(annotations).subscribe(() => {
      this.taxon = undefined;
      this.validationData$ = undefined;
      this.saving = false;
      this.cd.markForCheck();
    });
  }
}
