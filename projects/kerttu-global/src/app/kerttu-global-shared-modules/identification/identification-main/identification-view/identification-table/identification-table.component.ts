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
import { IGlobalRecording, IGlobalSpeciesWithAnnotation } from '../../../../../kerttu-global-shared/models';
import { IdentificationPanelComponent } from './identification-panel/identification-panel.component';
import { SpectrogramConfig } from '../../../../../../../../laji/src/app/shared-modules/audio-viewer/models';

@Component({
  selector: 'bsg-identification-table',
  templateUrl: './identification-table.component.html',
  styleUrls: ['./identification-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationTableComponent implements OnChanges {
  @ViewChildren(IdentificationPanelComponent) identificationPanels!: QueryList<IdentificationPanelComponent>;

  @Input() componentId = 0;
  @Input({ required: true }) recording!: IGlobalRecording;
  @Input({ required: true }) identifications!: IGlobalSpeciesWithAnnotation[];

  @Input() loading = false;
  @Input() showSoundTypeSelect = true;
  @Input() showOverlapsWithOtherSpeciesCheck = true;
  @Input() showDrawRelatedBoxBtn = true;
  @Input() buttonsDisabled = false;
  @Input() drawActive = false;

  @Input() birdRectangleColor = 'white';
  @Input() overlappingBirdRectangleColor = 'orange';

  @Input({ required: true }) sampleRate!: number;
  @Input({ required: true }) spectrogramConfig!: SpectrogramConfig;

  drawBoxActive: boolean[] = [];
  drawRelatedBoxActive: boolean[][] = [];
  panelOpenById: Record<string, boolean> = {};

  @Output() identificationsChange = new EventEmitter<IGlobalSpeciesWithAnnotation[]>();
  @Output() drawBoxClick = new EventEmitter<{drawClicked: boolean; rowIndex: number}>();
  @Output() drawRelatedBoxClick = new EventEmitter<{drawClicked: boolean; rowIndex: number; boxIndex: number}>();
  @Output() deleteBoxClick = new EventEmitter<{rowIndex: number; boxIndex: number; boxGroupIndex?: number}>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes.identifications || !this.drawActive) {
      this.drawBoxActive = this.identifications.map(() => false);
      this.drawRelatedBoxActive = this.identifications.map(identification => (identification.annotation.boxes || []).map(() => false));

      const prevLength = Object.keys(this.panelOpenById).length;
      const currLength = this.identifications?.length || 0;

      this.panelOpenById = this.identifications.reduce((panelOpenById: Record<string, boolean>, identification, idx) => {
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
    this.drawRelatedBoxActive = this.drawRelatedBoxActive.map(value => value.map(() => false));
    this.drawBoxActive = this.drawBoxActive.map((value, idx) => {
      if (idx === rowIndex) {
        return !value;
      }
      return false;
    });
    this.drawBoxClick.emit({drawClicked: this.drawBoxActive[rowIndex], rowIndex});
  }

  toggleDrawRelatedBox(rowIndex: number, boxIndex: number) {
    this.drawBoxActive = this.drawBoxActive.map(() => false);
    this.drawRelatedBoxActive = this.drawRelatedBoxActive.map((value, idx) => value.map((v, i) => {
      if (idx === rowIndex && boxIndex === i) {
        return !v;
      }
      return false;
    }));
    this.drawRelatedBoxClick.emit({drawClicked: this.drawRelatedBoxActive[rowIndex][boxIndex], rowIndex, boxIndex});
  }

  scrollDrawButtonIntoView(rowIndex: number, boxIndex?: number) {
    this.identificationPanels.get(rowIndex)?.scrollDrawButtonIntoView(boxIndex);
  }
}
