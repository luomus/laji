import { Component } from '@angular/core';
import { TaxonTypeEnum } from '../../bsg-shared/models';

@Component({
    selector: 'bsg-bird-identification-history',
    template: `
    <bsg-identification-results
      [taxonTypes]="taxonTypes"
    ></bsg-identification-results>
  `,
    standalone: false
})
export class BirdIdentificationResultsComponent {
  taxonTypes = [TaxonTypeEnum.bird, TaxonTypeEnum.mammal, TaxonTypeEnum.frog];
}
