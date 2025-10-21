import { Component } from '@angular/core';
import { TaxonTypeEnum } from '../../kerttu-global-shared/models';

@Component({
  selector: 'bsg-bird-identification-history',
  template: `
    <bsg-identification-results
      [taxonTypes]="taxonTypes"
    ></bsg-identification-results>
  `
})
export class BirdIdentificationResultsComponent {
  taxonTypes = [TaxonTypeEnum.bird];
}
