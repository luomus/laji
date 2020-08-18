import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {IRecording} from '../../model/recording';

@Component({
  selector: 'laji-recording-annotation',
  templateUrl: './recording-annotation.component.html',
  styleUrls: ['./recording-annotation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecordingAnnotationComponent implements OnChanges {
  @Input() annotations: any;
  @Input() recordings: IRecording[];

  currentRecording = 0;
  currentAnnotation = [];

  recordingQueue: number[];

  @Output() annotationsChange = new EventEmitter<any>();

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if (this.recordings && this.annotations) {
      this.recordingQueue = [];
      this.recordings.forEach((recording, i) => {
        if (!this.annotations[recording.id]) {
          this.recordingQueue.push(i);
        }
      });

      this.currentRecording = this.recordingQueue.length > 0 ? this.recordingQueue[0] : 0;
      this.currentAnnotation = this.annotations[this.recordings[this.currentRecording].id] || [];
    }
  }

  onTaxonSelect(taxon) {
    this.currentAnnotation.push(taxon.key);
    this.updateCurrentAnnotation();
  }

  onTaxonListUpdate(taxonList: string[]) {
    this.currentAnnotation = taxonList;
    this.updateCurrentAnnotation();
  }

  onRecordingChange(idx: string) {
    this.currentRecording = parseInt(idx, 10);
    this.currentAnnotation = this.annotations[this.recordings[this.currentRecording].id] || [];
  }

  toNextRecording() {
    if (this.currentAnnotation && this.currentAnnotation.length > 0) {
      this.recordingQueue = this.recordingQueue.filter(q => !(q === this.currentRecording));
    }
    if (this.recordingQueue[0] === this.currentRecording) {
      this.recordingQueue.shift();
      this.recordingQueue.push(this.currentRecording);
    }
    this.onRecordingChange(this.recordingQueue[0] + '');
  }

  private updateCurrentAnnotation() {
    this.currentAnnotation = [...this.currentAnnotation];
    this.annotations[this.recordings[this.currentRecording].id] = this.currentAnnotation;
    this.annotationsChange.emit(this.annotations);
  }
}
