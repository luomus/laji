import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { KerttuGlobalApi } from '../kerttu-global-shared/service/kerttu-global-api';

@Component({
  selector: 'laji-validation',
  template: `
    <laji-species-list *ngIf="!taxon" [speciesList]="speciesList$ | async" (taxonSelect)="onTaxonSelect($event)"></laji-species-list>
    <laji-species-validation *ngIf="taxon" [taxon]="taxon" [data]="validationData$ | async" (annotationsReady)="annotationsReady($event)"></laji-species-validation>
  `,
  styles: []
})
export class ValidationComponent {
  speciesList$: Observable<any[]>;

  taxon: string;
  validationData$: Observable<any[]>;

  constructor(
    private kerttuApi: KerttuGlobalApi
  ) {
    this.speciesList$ = this.kerttuApi.getSpeciesList();
  }

  onTaxonSelect(taxon: string) {
    this.taxon = taxon;
    this.validationData$ = this.kerttuApi.getDataForValidation(this.taxon);
  }

  annotationsReady(annotations) {
    this.taxon = undefined;
    this.validationData$ = undefined;
  }
}
