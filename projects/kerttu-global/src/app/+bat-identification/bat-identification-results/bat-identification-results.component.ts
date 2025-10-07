import { Component } from '@angular/core';
import { TaxonTypeEnum } from '../../kerttu-global-shared/models';

@Component({
  selector: 'bsg-bat-identification-history',
  template: `
    <bsg-identification-results
      [showMap]="false"
      [taxonTypes]="taxonTypes"
    ></bsg-identification-results>
  `
})
export class BatIdentificationResultsComponent {
  taxonTypes = [TaxonTypeEnum.bat];
}
