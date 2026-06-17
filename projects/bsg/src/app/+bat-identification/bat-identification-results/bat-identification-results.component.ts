import { Component } from '@angular/core';
import { TaxonTypeEnum } from '../../bsg-shared/models';

@Component({
    selector: 'bsg-bat-identification-history',
    template: `
    <bsg-identification-results
      [showMap]="false"
      [taxonTypes]="taxonTypes"
    ></bsg-identification-results>
  `,
    standalone: false
})
export class BatIdentificationResultsComponent {
  taxonTypes = [TaxonTypeEnum.bat];
}
