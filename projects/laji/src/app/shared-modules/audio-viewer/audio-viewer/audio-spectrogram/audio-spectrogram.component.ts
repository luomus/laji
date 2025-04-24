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
  ChangeDetectorRef,
  HostBinding
} from '@angular/core';

import {
  AudioViewerMode,
  AudioViewerArea,
  AudioViewerRectangle,
  AudioViewerRectangleGroup,
  SpectrogramConfig
} from '../../models';
import { timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { getSpectrogramSegmentLength } from '../../service/audio-viewer-utils';

@Component({
  selector: 'laji-audio-spectrogram',
  templateUrl: './audio-spectrogram.component.html',
  styleUrls: ['./audio-spectrogram.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioSpectrogramComponent implements AfterViewInit, OnChanges {
  @ViewChild('container', {static: true}) containerRef!: ElementRef<HTMLDivElement>;

  @Input() buffer?: AudioBuffer;
  @Input() view?: AudioViewerArea;
  @Input() defaultView?: AudioViewerArea;

  @Input() focusArea?: AudioViewerArea;
  @Input() highlightFocusArea? = false;
  @Input() onlyFocusAreaClickable? = false;
  @Input() onlyFocusAreaDrawable? = false;
  @Input() focusAreaColor?: string;
  @Input() showAxisLabels = true;
  @Input() axisFontSize = 10;
  @Input() rectangles?: (AudioViewerRectangle|AudioViewerRectangleGroup)[];

  @Input() pregeneratedSpectrogramUrl?: string;
  @Input() config?: SpectrogramConfig;

  @Input() currentTime?: number;
  @Input() mode?: AudioViewerMode;

  @Input() width?: number;
  @Input() height?: number;
  @Input() margin?: { top: number; bottom: number; left: number; right: number };
  @Input() adaptToContainerHeight = false;

  @Output() spectrogramLoading = new EventEmitter<boolean>();
  @Output() dragStart = new EventEmitter();
  @Output() dragEnd = new EventEmitter<number>();
  @Output() spectrogramClick = new EventEmitter<number>();
  @Output() spectrogramDblclick = new EventEmitter<number>();
  @Output() zoomEnd = new EventEmitter<AudioViewerArea>();
  @Output() drawEnd = new EventEmitter<AudioViewerArea>();

  _width!: number;
  _height!: number;
  _margin!: { top: number; bottom: number; left: number; right: number };

  @HostBinding('class.audio-spectrogram-responsive') get audioSpectrogramResponsiveClass() {
    return this.adaptToContainerHeight;
  }

  private defaultMargin = { top: 10, bottom: 40, left: 50, right: 10 };
  private defaultMarginWithoutLabels = { top: 10, bottom: 20, left: 30, right: 10 };

  constructor(
    private cdr: ChangeDetectorRef
  ) {
    this.onResize();
  }

  resize() {
    this.onResize();
    this.cdr.markForCheck();
  }

  @HostListener('window:resize')
  private onResize() {
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
      : this.adaptToContainerHeight && this.containerRef
        ? Math.max(this.containerRef.nativeElement.offsetHeight - this._margin.top - this._margin.bottom, 0)
        : this.config
          ? (getSpectrogramSegmentLength(this.config.targetWindowLengthInSeconds, this.config.sampleRate) / 2)
          : 0;
  }
}
