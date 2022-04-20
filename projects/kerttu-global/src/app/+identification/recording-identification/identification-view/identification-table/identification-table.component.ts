import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {IGlobalRecording, IGlobalSpeciesWithAnnotation} from '../../../../kerttu-global-shared/models';

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
  panelOpenByIdx = [];

  @Output() identificationsChange = new EventEmitter<IGlobalSpeciesWithAnnotation[]>();
  @Output() drawClick = new EventEmitter<{drawClicked: boolean; rowIndex: number}>();
  @Output() removeDrawingClick = new EventEmitter<number>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes.identifications || !this.drawActive) {
      this.drawClickedByIdx = this.identifications.map(() => false);
      this.panelOpenByIdx = this.identifications.map((el, idx) => idx === this.identifications.length - 1);
    }
  }

  annotationTypeChange(rowIndex: number, value: number) {
    this.identifications[rowIndex].annotation.occurrence = value;
    this.identificationsChange.emit(this.identifications);
  }

  deleteRow(rowIndex) {
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
