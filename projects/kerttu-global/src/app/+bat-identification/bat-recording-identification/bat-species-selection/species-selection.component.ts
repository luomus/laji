import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IGlobalSpecies } from '../../../kerttu-global-shared/models';
import { KerttuGlobalApi } from '../../../kerttu-global-shared/service/kerttu-global-api';
import { UserService } from '../../../../../../laji/src/app/shared/service/user.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'bsg-species-selection',
  template: `
    <bsg-species-selection-view
      [species]="(species$ | async) ?? []"
      (speciesSelect)="speciesSelect.emit($event)"
    ></bsg-species-selection-view>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesSelectionComponent {
  species$: Observable<IGlobalSpecies[]>;

  @Output() speciesSelect = new EventEmitter<number[]>();

  constructor(
    private userService: UserService,
    private kerttuGlobalApi: KerttuGlobalApi
  ) {
    this.species$ = of([{
      id: 14625,
      scientificName: 'Eptesicus nilssonii'
    }]);
  }
}
