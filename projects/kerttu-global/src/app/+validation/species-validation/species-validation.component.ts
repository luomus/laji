import { Component, ChangeDetectionStrategy, Input, Output, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';
import { IAudioViewerArea, AudioViewerMode, ISpectrogramConfig } from 'projects/laji/src/app/shared-modules/audio-viewer/models';
import { ILetterAnnotation, IKerttuRecording, LetterAnnotation } from '../../kerttu-global-shared/models';

@Component({
  selector: 'laji-species-validation',
  templateUrl: './species-validation.component.html',
  styleUrls: ['./species-validation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesValidationComponent implements OnChanges {
  @Input() data?: IKerttuRecording[];
  @Input() saving = false;

  annotation = LetterAnnotation;

  annotations: ILetterAnnotation[] = [];

  activeIndex = 0;
  activeLetter: any;

  zoomed = true;
  xRangePadding = 1;

  audioViewerMode: AudioViewerMode = 'default';
  spectrogramConfig: ISpectrogramConfig = {
    sampleRate: 32000,
    nperseg: 512,
    noverlap: 192,
    nbrOfRowsRemovedFromStart: 0
  };

  @Output() annotationsReady = new EventEmitter<ILetterAnnotation[]>();

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data) {
      if (this.data && this.data.length > 0) {
        this.activeIndex = 0;
        this.activeLetter = this.data[this.activeIndex];
        this.annotations = this.data.map(() => ({}));
      }
    }
  }

  toggleDrawMode() {
    this.audioViewerMode = this.audioViewerMode === 'draw' ? 'default' : 'draw';
  }

  onDrawEnd(area: IAudioViewerArea) {
    this.annotations[this.activeIndex].area = area;
    this.setDefaultAudioViewerMode();
  }

  returnToPrevious(e) {
    e.preventDefault();

    this.activeIndex--;
    this.activeLetter = this.data[this.activeIndex];
  }

  goToNext(e) {
    e.preventDefault();

    this.activeIndex++;
    this.activeLetter = this.data[this.activeIndex];
  }

  saveAndGoBack() {
    this.setDefaultAudioViewerMode();
    this.annotationsReady.emit(this.annotations);
  }

  goBack() {
    this.setDefaultAudioViewerMode();
    this.annotationsReady.emit(null);
  }

  private setDefaultAudioViewerMode() {
    this.audioViewerMode = 'default';
  }
}
