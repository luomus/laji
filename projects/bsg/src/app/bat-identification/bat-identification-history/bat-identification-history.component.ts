import { Component } from '@angular/core';
import { TaxonTypeEnum } from '../../bsg-shared/models';

@Component({
    selector: 'bsg-bat-identification-history',
    template: `
    <bsg-identification-history
      [taxonTypes]="taxonTypes"
    ></bsg-identification-history>
  `,
    standalone: false
})
export class BatIdentificationHistoryComponent {
  taxonTypes = [TaxonTypeEnum.bat];
}
