import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { IGlobalSpecies } from '../../../../kerttu-global-shared/models';

@Component({
  selector: 'bsg-species-selection-view',
  templateUrl: './species-selection-view.component.html',
  styleUrls: ['./species-selection-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesSelectionViewComponent {
  @Input({ required: true }) species: IGlobalSpecies[]|undefined;
  @Input({ required: true }) unknownSpeciesRecordingCount: number|undefined;

  selectedSpecies: (number|undefined)[] = [];
  height = 'calc(100vh - 230px)';

  @Output() speciesSelect = new EventEmitter<(number|undefined)[]>();

  onConfirm() {
    this.speciesSelect.emit(this.selectedSpecies);
  }
}
