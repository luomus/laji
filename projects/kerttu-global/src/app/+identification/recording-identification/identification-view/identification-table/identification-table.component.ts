import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { IGlobalRecording, IGlobalSpeciesWithAnnotation } from '../../../../kerttu-global-shared/models';

@Component({
  selector: 'bsg-identification-table',
  templateUrl: './identification-table.component.html',
  styleUrls: ['./identification-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationTableComponent implements OnChanges {
  @Input() recording: IGlobalRecording;
  @Input() identifications: IGlobalSpeciesWithAnnotation[];
  @Input() loading = false;
  @Input() componentId = 0;
  @Input() drawActive = false;

  drawClickedByIdx = [];
  panelOpenById: Record<string, boolean> = {};

  @Output() identificationsChange = new EventEmitter<IGlobalSpeciesWithAnnotation[]>();
  @Output() drawClick = new EventEmitter<{drawClicked: boolean; rowIndex: number}>();
  @Output() deleteBoxClick = new EventEmitter<{rowIndex: number; boxIndex: number}>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes.identifications || !this.drawActive) {
      this.drawClickedByIdx = this.identifications.map(() => false);

      const prevLength = Object.keys(this.panelOpenById).length;
      const currLength = this.identifications?.length || 0;

      this.panelOpenById = this.identifications.reduce((result, identification, idx) => {
        if (currLength > prevLength) {
          result[identification.id] = idx === this.identifications.length - 1;
        } else {
          result[identification.id] = this.panelOpenById[identification.id];
        }
        return result;
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

  toggleDrawButton(rowIndex: number) {
    this.drawClickedByIdx = this.drawClickedByIdx.map((value, idx) => {
      if (idx === rowIndex) {
        return !value;
      }
      return false;
    });
    this.drawClick.emit({drawClicked: this.drawClickedByIdx[rowIndex], rowIndex});
  }
}
