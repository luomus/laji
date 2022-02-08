import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  TemplateRef
} from '@angular/core';
import { AudioService } from '../service/audio.service';
import { Subscription } from 'rxjs';
import { AudioViewerMode, IAudio, IAudioViewerArea, IAudioViewerRectangle, ISpectrogramConfig } from '../models';
import { AudioPlayer } from '../service/audio-player';
import { AudioViewerUtils } from '../service/audio-viewer-utils';

@Component({
  selector: 'laji-audio-viewer',
  templateUrl: './audio-viewer.component.html',
  styleUrls: ['./audio-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioViewerComponent implements OnChanges, OnDestroy {
  @Input() audio: IAudio;

  @Input() focusArea: IAudioViewerArea;
  @Input() highlightFocusArea = false;

  @Input() rectangles: IAudioViewerRectangle[];

  @Input() zoomTime = false;
  @Input() timePaddingOnZoom = 1;
  @Input() zoomFrequency = false;
  @Input() frequencyPaddingOnZoom = 500;

  @Input() autoplay = false;
  @Input() autoplayRepeat = 1;

  @Input() showControls = true;
  @Input() showZoomControl = false; // zoom control allows the user to zoom into spectrogram
  @Input() showAxisLabels = true;
  @Input() axisFontSize = 10;
  @Input() playOnlyOnSingleClick = false; // play only when the user clicks once and not double-clicks

  @Input() showPregeneratedSpectrogram = false;

  @Input() spectrogramConfig: ISpectrogramConfig = {
    sampleRate: 22050,
    nperseg: 256,
    noverlap: 256 - 160,
    nbrOfRowsRemovedFromStart: 2,
    maxNbrOfColsForNoiseEstimation: 6000,
    noiseReductionParam: 2,
    logRange: 3
  };

  @Input() mode: AudioViewerMode = 'default';

  @Input() spectrogramWidth: number;
  @Input() spectrogramHeight: number;
  @Input() spectrogramMargin: { top: number, bottom: number, left: number, right: number };

  @Input() audioInfoTpl: TemplateRef<any>;

  @Input() zoomInfoText: string;

  buffer: AudioBuffer;
  audioPlayer: AudioPlayer;

  loading = false;
  hasError = false;

  view: IAudioViewerArea;
  defaultView: IAudioViewerArea;

  @Output() audioLoading = new EventEmitter<boolean>();
  @Output() drawEnd = new EventEmitter<IAudioViewerArea>();
  @Output() spectrogramDblclick = new EventEmitter<number>();
  @Output() modeChange = new EventEmitter<AudioViewerMode>();

  private audioSub: Subscription;
  private clicks = 0;

  constructor(
    private cdr: ChangeDetectorRef,
    private audioService: AudioService,
    private ngZone: NgZone
  ) {
    this.audioPlayer = new AudioPlayer(this.audioService, this.ngZone, this.cdr);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.audio) {
      this.clear();
      this.setAudioLoading(true);

      if (this.audio) {
        this.audioSub = this.audioService.getAudioBuffer(this.audio.url, this.audio.duration).subscribe((buffer) => {
          if (!this.areaIsValid(buffer, this.focusArea)) {
            this.onError();
            return;
          }

          this.buffer = buffer;
          this.audioPlayer.setBuffer(buffer);
          this.setDefaultView();

          if (this.autoplay) {
            this.audioPlayer.startAutoplay(this.autoplayRepeat);
          }

          this.cdr.markForCheck();
        }, () => {
          this.onError();
        });
      }
    } else if (!this.hasError) {
      if (changes.focusArea || changes.highlightFocusArea || changes.zoomTime || changes.timePaddingOnZoom || changes.zoomFrequency || changes.frequencyPaddingOnZoom) {
        this.setDefaultView();
      } else if (changes.mode) {
        this.audioPlayer.stop();
      }
    }
  }

  ngOnDestroy() {
    this.clear();
  }

  onSpectrogramDragStart() {
    this.audioPlayer.stop();
  }

  onSpectrogramDragEnd(time: number) {
    this.audioPlayer.startFrom(time);
  }

  onSpectrogramClick(time: number) {
    if (!this.playOnlyOnSingleClick) {
      this.audioPlayer.startFrom(time);
    } else {
      // ensure that the click is not a double-click by waiting a while and checking that the number of clicks have not increased
      this.clicks++;
      if (this.clicks === 1) {
        setTimeout(() => {
          if (this.clicks === 1) {
            this.audioPlayer.startFrom(time);
          }
          this.clicks = 0;
        }, 300);
      }
    }
  }

  onSpectrogramZoomEnd(area: IAudioViewerArea) {
    this.changeMode('default');
    this.setView(area);
  }

  onSpectrogramDrawEnd(area: IAudioViewerArea) {
    this.drawEnd.emit({
      xRange: [area.xRange[0], area.xRange[1]],
      yRange: area.yRange
    });
  }

  clearZoomArea() {
    this.setView(this.defaultView);

  }

  toggleZoomMode() {
    this.audioPlayer.stop();
    this.changeMode(this.mode === 'zoom' ? 'default' : 'zoom');
  }

  setAudioLoading(loading: boolean) {
    this.loading = loading;
    this.audioLoading.emit(loading);
  }

  setView(view: IAudioViewerArea) {
    this.view = view;
    this.audioPlayer.setPlayArea(this.getPlayArea());
  }

  private clear() {
    if (this.audioSub) {
      this.audioSub.unsubscribe();
    }

    this.buffer = undefined;
    this.view = undefined;
    this.hasError = false;
    this.audioPlayer.clear();
  }

  private setDefaultView() {
    const maxTime = this.buffer.duration;
    const maxFreq = AudioViewerUtils.getMaxFreq(this.spectrogramConfig.sampleRate);

    this.defaultView = {
      xRange: AudioViewerUtils.getPaddedRange(
        this.focusArea?.xRange, this.zoomTime ? this.timePaddingOnZoom : undefined, 0, maxTime
      ),
      yRange: AudioViewerUtils.getPaddedRange(
        this.focusArea?.yRange, this.zoomFrequency ? this.frequencyPaddingOnZoom : undefined, 0, maxFreq
      )
    };
    this.setView(this.defaultView);
  }

  private getPlayArea(): IAudioViewerArea {
    const xRange = this.highlightFocusArea && this.view === this.defaultView && this.focusArea ? this.focusArea.xRange : this.view.xRange;
    const yRange = this.zoomFrequency && this.focusArea ? this.focusArea.yRange : this.view.yRange;

    return { xRange, yRange };
  }

  private areaIsValid(buffer: AudioBuffer, area: IAudioViewerArea): boolean {
    const [minValue, maxValue] = [0, buffer.duration];
    return !(area?.xRange && this.rangeIsNotValid(area.xRange, minValue, maxValue));
  }

  private rangeIsNotValid(range: number[], minValue: number, maxValue: number): boolean {
    if (range[1] < range[0]) {
      return true;
    }
    return range[1] < minValue || range[0] > maxValue;
  }

  private onError() {
    this.hasError = true;
    this.setAudioLoading(false);
    this.cdr.markForCheck();
  }

  private changeMode(mode: AudioViewerMode) {
    this.mode = mode;
    this.modeChange.emit(this.mode);
  }
}
