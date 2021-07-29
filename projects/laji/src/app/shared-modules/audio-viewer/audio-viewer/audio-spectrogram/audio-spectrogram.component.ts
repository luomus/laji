import {
  Component,
  Input,
  AfterViewInit,
  OnChanges,
  ElementRef,
  ViewChild,
  HostListener,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import { AudioViewerMode, IAudio, IAudioViewerArea, IAudioViewerRectangle, ISpectrogramConfig } from '../../models';

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
  @Input() showAxisLabels = true;
  @Input() rectangles: IAudioViewerRectangle[];

  @Input() config: ISpectrogramConfig;

  @Input() currentTime: number;
  @Input() mode: AudioViewerMode;

  @Input() width: number;
  @Input() height: number;

  @Output() spectrogramReady = new EventEmitter();
  @Output() dragStart = new EventEmitter();
  @Output() dragEnd = new EventEmitter<number>();
  @Output() zoomEnd = new EventEmitter<IAudioViewerArea>();
  @Output() drawEnd = new EventEmitter<IAudioViewerArea>();

  _width: number;
  _height: number;
  margin: { top: number, bottom: number, left: number, right: number };

  visibleArea: IAudioViewerArea;

  private marginWithLabels = { top: 10, bottom: 40, left: 50, right: 10};
  private marginWithoutLabels = { top: 10, bottom: 20, left: 30, right: 10};

  constructor(
    private cdr: ChangeDetectorRef
  ) {
    this.updateMargin();
  }

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

  ngOnChanges() {
    this.updateMargin();
    this.onResize();
  }

  private updateWidthAndHeigth() {
    this._width = this.width ? this.width : Math.max(this.containerRef.nativeElement.offsetWidth - this.margin.left - this.margin.right, 0);
    this._height = this.height ? this.height : this.config ? this.config.nperseg / 2 : 0;
  }

  private updateMargin() {
    if (this.showAxisLabels) {
      this.margin = this.marginWithLabels;
    } else {
      this.margin = this.marginWithoutLabels;
    }
  }
}
