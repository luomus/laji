import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {IRecording} from '../../model/recording';
import {IRecordingAnnotations} from '../../model/annotation';

@Component({
  selector: 'laji-kerttu-recording-annotation',
  templateUrl: './kerttu-recording-annotation.component.html',
  styleUrls: ['./kerttu-recording-annotation.component.scss']
})
export class KerttuRecordingAnnotationComponent implements OnChanges {
  @Input() annotations: IRecordingAnnotations;
  @Input() recordings: IRecording[];

  currentRecording = 0;
  currentAnnotation = [];

  @Output() annotationsChange = new EventEmitter<IRecordingAnnotations>();

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.recordings && this.recordings) {
      this.currentRecording = 0;
    }
    if (this.recordings && this.annotations) {
      this.currentAnnotation = this.annotations[this.recordings[this.currentRecording].id] || [];
    }
  }

  onTaxonSelect(taxon) {
    this.currentAnnotation.push(taxon.key);
    this.currentAnnotation = [...this.currentAnnotation];
    this.annotations[this.recordings[this.currentRecording].id] = this.currentAnnotation;
    this.annotationsChange.emit(this.annotations);
  }

  onRecordingChange(idx: string) {
    this.currentRecording = parseInt(idx, 10);
    this.currentAnnotation = this.annotations[this.recordings[this.currentRecording].id] || [];
  }

  toNextRecording() {
    this.onRecordingChange(this.currentRecording + 1 + '');
  }
}
