import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChildren,
  QueryList
} from '@angular/core';
import { IGlobalRecording, IGlobalSpeciesWithAnnotation } from '../../../../kerttu-global-shared/models';
import { IdentificationPanelComponent } from './identification-panel/identification-panel.component';
import { ISpectrogramConfig } from '../../../../../../../laji/src/app/shared-modules/audio-viewer/models';

@Component({
  selector: 'bsg-identification-table',
  templateUrl: './identification-table.component.html',
  styleUrls: ['./identification-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationTableComponent implements OnChanges {
  @ViewChildren(IdentificationPanelComponent) identificationPanels: QueryList<IdentificationPanelComponent>;

  @Input() recording: IGlobalRecording;
  @Input() identifications: IGlobalSpeciesWithAnnotation[];
  @Input() loading = false;
  @Input() buttonsDisabled = false;
  @Input() componentId = 0;
  @Input() drawActive = false;
  @Input() birdRectangleColor = 'white';
  @Input() overlappingBirdRectangleColor = 'orange';
  @Input() spectrogramConfig: ISpectrogramConfig;

  drawBoxClickedByIdx = [];
  panelOpenById: Record<string, boolean> = {};

  @Output() identificationsChange = new EventEmitter<IGlobalSpeciesWithAnnotation[]>();
  @Output() drawBoxClick = new EventEmitter<{drawClicked: boolean; rowIndex: number}>();
  @Output() deleteBoxClick = new EventEmitter<{rowIndex: number; boxIndex: number}>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes.identifications || !this.drawActive) {
      this.drawBoxClickedByIdx = this.identifications.map(() => false);

      const prevLength = Object.keys(this.panelOpenById).length;
      const currLength = this.identifications?.length || 0;

      this.panelOpenById = this.identifications.reduce((panelOpenById, identification, idx) => {
        if (currLength > prevLength) {
          panelOpenById[identification.id] = idx === this.identifications.length - 1;
        } else {
          panelOpenById[identification.id] = this.panelOpenById[identification.id];
        }
        return panelOpenById;
      }, {});
    }
  }

  onIdentificationChange(rowIndex: number, identification: IGlobalSpeciesWithAnnotation) {
    this.identifications[rowIndex] = identification;
    this.identificationsChange.emit(this.identifications);
  }

  deleteRow(rowIndex: number) {
    this.identifications = this.identifications.filter((_, i) => i !== rowIndex);
    this.identificationsChange.emit(this.identifications);
  }

  toggleDrawBox(rowIndex: number) {
    this.drawBoxClickedByIdx = this.drawBoxClickedByIdx.map((value, idx) => {
      if (idx === rowIndex) {
        return !value;
      }
      return false;
    });
    this.drawBoxClick.emit({drawClicked: this.drawBoxClickedByIdx[rowIndex], rowIndex});
  }

  scrollDrawButtonIntoView(rowIndex: number) {
    this.identificationPanels.get(rowIndex).scrollDrawButtonIntoView();
  }
}
