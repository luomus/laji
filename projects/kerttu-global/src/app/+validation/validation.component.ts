import { ChangeDetectorRef, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { KerttuGlobalApi } from '../kerttu-global-shared/service/kerttu-global-api';

@Component({
  selector: 'laji-validation',
  template: `
    <laji-species-list *ngIf="!taxon" [speciesList]="speciesList$ | async" (taxonSelect)="onTaxonSelect($event)"></laji-species-list>
    <laji-species-validation *ngIf="taxon" [taxon]="taxon" [data]="validationData$ | async" (annotationsReady)="annotationsReady($event)" [saving]="saving"></laji-species-validation>
  `,
  styles: []
})
export class ValidationComponent {
  speciesList$: Observable<any[]>;

  taxon: string;
  validationData$: Observable<any[]>;
  saving = false;

  constructor(
    private kerttuApi: KerttuGlobalApi,
    private cd: ChangeDetectorRef
  ) {
    this.speciesList$ = this.kerttuApi.getSpeciesList();
    // this.onTaxonSelect('MX.26282');
  }

  onTaxonSelect(taxon: string) {
    this.taxon = taxon;
    this.validationData$ = this.kerttuApi.getDataForValidation(this.taxon);
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
