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

import { AudioViewerMode, IAudioViewerArea, IAudioViewerRectangle, ISpectrogramConfig } from '../../models';
import { timer } from 'rxjs';
import { take } from 'rxjs/operators';
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
  @Input() view: IAudioViewerArea;
  @Input() defaultView: IAudioViewerArea;

  @Input() focusArea: IAudioViewerArea;
  @Input() highlightFocusArea = false;
  @Input() onlyFocusAreaClickable = false;
  @Input() onlyFocusAreaDrawable = false;
  @Input() focusAreaColor?: string;
  @Input() showAxisLabels = true;
  @Input() axisFontSize = 10;
  @Input() rectangles: IAudioViewerRectangle[];

  @Input() pregeneratedSpectrogramUrl?: string;
  @Input() config: ISpectrogramConfig;

  @Input() currentTime: number;
  @Input() mode: AudioViewerMode;

  @Input() width: number;
  @Input() height: number;
  @Input() margin: { top: number; bottom: number; left: number; right: number };

  @Output() spectrogramLoading = new EventEmitter<boolean>();
  @Output() dragStart = new EventEmitter();
  @Output() dragEnd = new EventEmitter<number>();
  @Output() spectrogramClick = new EventEmitter<number>();
  @Output() spectrogramDblclick = new EventEmitter<number>();
  @Output() zoomEnd = new EventEmitter<IAudioViewerArea>();
  @Output() drawEnd = new EventEmitter<IAudioViewerArea>();

  _width: number;
  _height: number;
  _margin: { top: number; bottom: number; left: number; right: number };

  private defaultMargin = { top: 10, bottom: 40, left: 50, right: 10 };
  private defaultMarginWithoutLabels = { top: 10, bottom: 20, left: 30, right: 10 };

  constructor(
    private cdr: ChangeDetectorRef
  ) {
    this.onResize();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateMargin();
    this.updateWidthAndHeight();
  }

  ngAfterViewInit() {
    // update width and height immediately and after some time has passed to ensure that the content has loaded
    timer(0, 300).pipe(take(2)).subscribe(() => {
      this.onResize();
      this.cdr.markForCheck();
    });
  }

  ngOnChanges() {
    this.onResize();
  }

  private updateMargin() {
    if (this.margin) {
      this._margin = this.margin;
      return;
    }

    if (this.showAxisLabels) {
      this._margin = this.defaultMargin;
    } else {
      this._margin = this.defaultMarginWithoutLabels;
    }
  }

  private updateWidthAndHeight() {
    this._width = this.width
      ? this.width
      : this.containerRef
        ? Math.max(this.containerRef.nativeElement.offsetWidth - this._margin.left - this._margin.right, 0)
        : 0;
    this._height = this.height
      ? this.height
      : this.config
        ? (AudioViewerUtils.getSpectrogramSegmentLength(this.config.targetWindowLengthInSeconds, this.config.sampleRate) / 2)
        : 0;
  }
}
