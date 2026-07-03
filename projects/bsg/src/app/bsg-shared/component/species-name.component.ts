import { Input, Component } from '@angular/core';
import { Species, TaxonomyListEnum, TaxonTypeEnum } from '../models';

@Component({
  selector: 'bsg-species-name',
  template: `
      @if (species) {
        @if (!(species.taxonType === taxonTypeEnum.other && species.taxonomyList === taxonomyListEnum.default)) {
          @if (species.commonName) { {{ species.commonName }} - }<i>{{ species.scientificName }}</i>
        } @else {
          {{ species.scientificName }}
        }
      }
    `,
  standalone: false
})
export class SpeciesNameComponent {
  @Input() species?: Species;

  taxonTypeEnum = TaxonTypeEnum;
  taxonomyListEnum = TaxonomyListEnum;
}
