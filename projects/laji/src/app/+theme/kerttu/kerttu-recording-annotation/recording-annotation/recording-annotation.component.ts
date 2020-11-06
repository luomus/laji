import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {IRecording} from '../../models';

@Component({
  selector: 'laji-recording-annotation',
  templateUrl: './recording-annotation.component.html',
  styleUrls: ['./recording-annotation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecordingAnnotationComponent implements OnChanges {
  @Input() recording: IRecording;

  currentAnnotation = [];

  @Output() annotationsChange = new EventEmitter<any>();

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    this.currentAnnotation = [];
  }

  onTaxonSelect(taxon) {
    this.currentAnnotation.push(taxon.key);
    this.annotationsChange.emit(this.currentAnnotation);
  }

  onTaxonListUpdate(taxonList: string[]) {
    this.currentAnnotation = taxonList;
    this.annotationsChange.emit(this.currentAnnotation);
  }

  toNextRecording() {

  }
}
