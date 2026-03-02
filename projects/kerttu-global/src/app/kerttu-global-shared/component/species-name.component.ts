import { Input, Component } from '@angular/core';
import { IGlobalSpecies, TaxonTypeEnum } from '../models';

@Component({
    selector: 'bsg-species-name',
    template: `
      @if (species) {
        @if (species.taxonType !== taxonTypeEnum.other) {
          @if (species.commonName) { {{ species.commonName }} - }<i>{{ species.scientificName }}</i>
        } @else {
          {{ 'otherSounds.' + species.scientificName | translate }}
        }
      }
    `,
    standalone: false
})
export class SpeciesNameComponent {
  @Input() species?: IGlobalSpecies;

  taxonTypeEnum = TaxonTypeEnum;
}
