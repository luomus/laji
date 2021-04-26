import { Component, ChangeDetectionStrategy, Input, Output, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';
import { LetterAnnotation } from 'projects/laji/src/app/+theme/kerttu/models';
import { IAudioViewerArea, AudioViewerMode } from 'projects/laji/src/app/shared-modules/audio-viewer/models';

@Component({
  selector: 'laji-species-validation',
  templateUrl: './species-validation.component.html',
  styleUrls: ['./species-validation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesValidationComponent implements OnChanges {
  @Input() taxon: string;
  @Input() data: any[];

  annotation = LetterAnnotation;

  currentAnnotation: {
    annotation?: LetterAnnotation,
    area?: IAudioViewerArea,
    notes?: string
  } = {};
  annotations = [];

  activeIndex = 0;
  activeLetter: any;

  zoomed = true;
  xRangePadding = 1;

  audioViewerMode: AudioViewerMode = 'default';

  @Output() annotationsReady = new EventEmitter<LetterAnnotation[]>();

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data) {
      this.activeIndex = 0;
      this.activeLetter = this.data?.[this.activeIndex];
    }
  }

  onAnnotationChange(annotation: LetterAnnotation)  {
    this.annotations[this.activeIndex] = annotation;

    if (this.activeIndex !== this.data.length - 1) {
      this.activeIndex++;
      this.activeLetter = this.data[this.activeIndex];
    } else {
      this.activeLetter = null;
    }
  }

  toggleDrawMode() {
    this.audioViewerMode = this.audioViewerMode === 'draw' ? 'default' : 'draw';
  }

  onDrawEnd(area: IAudioViewerArea) {
    this.currentAnnotation.area = area;

    this.activeLetter.xRange = area.xRange;
    this.activeLetter.yRange = area.yRange;
    this.audioViewerMode = 'default';
  }

  returnToPrevious() {
    this.activeIndex--;
    this.activeLetter = this.data[this.activeIndex];
  }

  goToNext() {
    if (this.activeIndex !== this.data.length - 1) {
      this.activeIndex++;
      this.activeLetter = this.data[this.activeIndex];
    } else {
      this.activeLetter = null;
    }
  }

  saveAndGoBack() {
    this.annotationsReady.emit(this.annotations);
  }
}
