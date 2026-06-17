import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Site, Species } from '../../../../kerttu-global-shared/models';

@Component({
    selector: 'bsg-species-selection-view',
    templateUrl: './species-selection-view.component.html',
    styleUrls: ['./species-selection-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SpeciesSelectionViewComponent {
  @Input({ required: true }) sites: Site[]|undefined;
  @Input({ required: true }) species: Species[]|undefined;
  @Input({ required: true }) unknownSpeciesRecordingCount: number|undefined;

  selectedSite: number|undefined = undefined;
  selectedSpecies: (number|undefined)[] = [];
  height = 'calc(100vh - 230px)';

  @Output() siteChange: EventEmitter<number|undefined> = new EventEmitter<number|undefined>();
  @Output() speciesSelect = new EventEmitter<(number|undefined)[]>();

  onConfirm() {
    this.speciesSelect.emit(this.selectedSpecies);
  }
}
