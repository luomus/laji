import { Component } from '@angular/core';
import { TaxonTypeEnum } from '../../bsg-shared/models';

@Component({
    selector: 'bsg-bird-identification-history',
    template: `
    <bsg-identification-history
      [taxonTypes]="taxonTypes"
    ></bsg-identification-history>
  `,
    standalone: false
})
export class BirdIdentificationHistoryComponent {
  taxonTypes = [TaxonTypeEnum.bird, TaxonTypeEnum.insect, TaxonTypeEnum.frog, TaxonTypeEnum.mammal];
}
