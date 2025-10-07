import { Input, Component } from '@angular/core';
import { IGlobalSpecies, TaxonTypeEnum } from '../models';

@Component({
  selector: 'bsg-species-name',
  template: `
    <ng-container *ngIf="species">
      <ng-container *ngIf="species.taxonType !== taxonTypeEnum.other else otherSound">
        <ng-container *ngIf="species.commonName">{{ species.commonName }} - </ng-container><i>{{ species.scientificName }}</i>
      </ng-container>
      <ng-template #otherSound>
        {{ (species.scientificName === 'Other animals'
        ? ('otherAnimalsThanBirds' | translateWithTaxonType: mainTaxonType)
        : ('otherSounds.' + species.scientificName) | translate) }}
      </ng-template>
    </ng-container>
  `
})
export class SpeciesNameComponent {
  @Input() species?: IGlobalSpecies;
  @Input() mainTaxonType?: TaxonTypeEnum;

  taxonTypeEnum = TaxonTypeEnum;
}
