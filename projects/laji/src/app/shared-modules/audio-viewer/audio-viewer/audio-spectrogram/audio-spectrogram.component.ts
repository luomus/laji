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
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { AudioViewerMode, IAudio, IAudioViewerArea, ISpectrogramConfig } from '../../models';

@Component({
  selector: 'laji-audio-spectrogram',
  templateUrl: './audio-spectrogram.component.html',
  styleUrls: ['./audio-spectrogram.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioSpectrogramComponent implements AfterViewInit, OnChanges {
  @ViewChild('container', {static: true}) containerRef: ElementRef<HTMLDivElement>;

  @Input() audio: IAudio;
  @Input() view: IAudioViewerArea;
  @Input() defaultView: IAudioViewerArea;

  @Input() focusArea: IAudioViewerArea;
  @Input() highlightFocusArea = false;
  @Input() onlyFocusAreaClickable = false;

  @Input() config: ISpectrogramConfig;

  @Input() currentTime: number;
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

  constructor(
    private cdr: ChangeDetectorRef
  ) {}

  @HostListener('window:resize')
  onResize() {
    this.updateWidthAndHeigth();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.onResize();
      this.cdr.markForCheck();
    }, 200);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.config) {
      this.onResize();
    }
  }

  private updateWidthAndHeigth() {
    this.width = Math.max(this.containerRef.nativeElement.offsetWidth - this.margin.left - this.margin.right, 0);
    this.height = this.config ? this.config.nperseg / 2 : 0;
  }
}
