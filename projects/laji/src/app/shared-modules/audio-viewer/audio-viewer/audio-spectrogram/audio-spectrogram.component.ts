import {
  Component,
  Input,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  HostListener,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';

import { AudioViewerMode, IAudioViewerArea, ISpectrogramConfig } from '../../models';
import { AudioViewerUtils } from '../../service/audio-viewer-utils';

@Component({
  selector: 'laji-audio-spectrogram',
  templateUrl: './audio-spectrogram.component.html',
  styleUrls: ['./audio-spectrogram.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioSpectrogramComponent implements AfterViewInit, OnChanges {
  @ViewChild('container', {static: true}) containerRef: ElementRef<HTMLDivElement>;

  @Input() buffer: AudioBuffer;
  @Input() config: ISpectrogramConfig;

  @Input() currentTime: number;

  @Input() focusArea: IAudioViewerArea;
  @Input() highlightFocusArea = false;

  @Input() zoomArea: IAudioViewerArea;
  @Input() zoomFrequency = false;
  @Input() frequencyPaddingOnZoom = 500;

  @Input() mode: AudioViewerMode;

  @Output() spectrogramReady = new EventEmitter();
  @Output() dragStart = new EventEmitter();
  @Output() dragEnd = new EventEmitter<number>();
  @Output() zoomEnd = new EventEmitter<IAudioViewerArea>();
  @Output() drawEnd = new EventEmitter<IAudioViewerArea>();

  width: number;
  height: number;
  margin: { top: number, bottom: number, left: number, right: number } = { top: 10, bottom: 40, left: 50, right: 10}; // space for x axis and y axis

  visibleArea: IAudioViewerArea;

  @HostListener('window:resize')
  onResize() {
    this.updateWidthAndHeigth();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.onResize();
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.config) {
      this.updateWidthAndHeigth();
    }
    if (changes.buffer || changes.zoomArea || changes.zoomFrequency || changes.frequencyPaddingOnZoom) {
      this.updateZoomArea();
    }
  }

  private updateWidthAndHeigth() {
    this.width = Math.max(this.containerRef.nativeElement.offsetWidth - this.margin.left - this.margin.right, 0);
    this.height = this.config ? this.config.nperseg / 2 : 0;
  }

  private updateZoomArea() {
    if (this.buffer && this.config) {
      const [maxTime, maxFreq] = AudioViewerUtils.getMaxTimeAndFreq(this.buffer, this.config.sampleRate);

      if (this.zoomArea) {
        this.visibleArea = this.zoomArea;
      } else {
        this.visibleArea = {
          xRange: [0, maxTime],
          yRange: AudioViewerUtils.getPaddedRange(
            this.focusArea?.yRange, this.zoomFrequency ? this.frequencyPaddingOnZoom : undefined, 0, maxFreq
          )
        };
      }
    }
  }
}
