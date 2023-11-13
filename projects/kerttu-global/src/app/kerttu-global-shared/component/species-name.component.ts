import { Input, Component } from '@angular/core';
import { IGlobalSpecies } from '../models';

@Component({
  selector: 'bsg-species-name',
  template: `
    <ng-container *ngIf="species">
      <ng-container *ngIf="species.commonName">{{ species.commonName }} - </ng-container><i>{{ species.scientificName }}</i>
    </ng-container>
  `
})
export class SpeciesNameComponent {
  @Input() species?: IGlobalSpecies;
}
