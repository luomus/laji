import {
  ChangeDetectionStrategy,
  Component,
  effect,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  signal,
  SimpleChanges,
  OnChanges,
  TemplateRef,
  ViewChild, ChangeDetectorRef
} from '@angular/core';
import {
  AudioViewerMode,
  Audio,
  AudioViewerArea,
  AudioViewerRectangle,
  AudioViewerRectangleGroup,
  SpectrogramConfig, AudioViewerFocusArea, AudioViewerControls
} from '../models';
import { defaultSpectrogramConfig } from '../variables';
import { AudioPlayer } from '../service/audio-player';
import { AudioViewerView } from '../service/audio-viewer-view';
import { delay } from 'rxjs/operators';
import { rangeIsInsideRange } from '../service/audio-viewer-utils';
import { Subscription } from 'rxjs';
import { AudioService } from '../service/audio.service';
import { AudioSpectrogramComponent } from './audio-spectrogram/audio-spectrogram.component';

@Component({
  selector: 'laji-audio-viewer',
  templateUrl: './audio-viewer.component.html',
  styleUrls: ['./audio-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioViewerComponent implements OnChanges {
  @Input() audio?: Audio;
  @Input() sampleRate = 44100;

  @Input() focusArea?: AudioViewerFocusArea;
  @Input() rectangles?: (AudioViewerRectangle|AudioViewerRectangleGroup)[];

  @Input() autoplay = false;
  @Input() autoplayRepeat = 1;

  @Input() showControls = true;
  @Input() controls?: AudioViewerControls;

  @Input() showAxisLabels = true;
  @Input() axisFontSize = 10;
  @Input() playOnlyOnSingleClick = false; // play the recording only when the user clicks once and not double-clicks

  @Input() showPregeneratedSpectrogram = false;
  @Input() spectrogramConfig: SpectrogramConfig = defaultSpectrogramConfig;

  @Input() spectrogramWidth?: number;
  @Input() spectrogramHeight?: number;
  @Input() spectrogramMargin?: { top: number; bottom: number; left: number; right: number };

  @Input() adaptToContainerHeight = false;

  @Input() mode: AudioViewerMode = 'default';

  @Input() customControlsTpl?: TemplateRef<any>;
  @Input() audioInfoTpl?: TemplateRef<any>;

  audioPlayer: AudioPlayer;
  audioViewerView: AudioViewerView;

  private bufferSignal = signal<AudioBuffer|undefined>(undefined);
  buffer = this.bufferSignal.asReadonly();

  loading = false;
  hasError = false;

  @Output() audioLoading = new EventEmitter<boolean>();
  @Output() drawEnd = new EventEmitter<AudioViewerArea>();
  @Output() spectrogramDblclick = new EventEmitter<number>();
  @Output() modeChange = new EventEmitter<AudioViewerMode>();

  @ViewChild(AudioSpectrogramComponent) spectrogramComponent!: AudioSpectrogramComponent;

  @HostBinding('class.audio-viewer-responsive') get audioViewerResponsiveClass() {
    return this.adaptToContainerHeight;
  }

  private spectrogramConfigSignal = signal<SpectrogramConfig>(this.spectrogramConfig);
  private focusAreaSignal = signal<AudioViewerFocusArea|undefined>(this.focusArea);

  private audioSub?: Subscription;
  private clicks = 0;

  constructor(
    private audioService: AudioService,
    private cdr: ChangeDetectorRef
  ) {
    this.audioViewerView = new AudioViewerView(
      this.buffer,
      this.spectrogramConfigSignal.asReadonly(),
      this.focusAreaSignal.asReadonly(),
    );
    this.audioPlayer = new AudioPlayer(this.buffer, this.audioViewerView.playArea);

    effect(() => {
      this.modeChange.emit(this.audioViewerView.mode());
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.spectrogramConfig) {
      this.spectrogramConfigSignal.set(this.spectrogramConfig);
    }

    if (changes.focusArea) {
      this.focusAreaSignal.set(this.focusArea);
    }

    if (changes.mode) {
      this.audioPlayer.stop();
      this.audioViewerView.setMode(this.mode);
    }

    if (changes.audio) {
      this.audioSub?.unsubscribe();
      this.bufferSignal.set(undefined);
      this.setAudioLoading(true);

      if (this.audio) {
        this.audioSub = this.audioService.getAudioBuffer(this.audio.url, this.sampleRate, this.audio.duration).pipe(
          delay(0) // has a delay because otherwise the changes are not always detected
        ).subscribe((buffer) => {
          if (this.focusArea?.area.xRange && !rangeIsInsideRange(this.focusArea.area.xRange, [0, buffer.duration])) {
            this.onError();
            return;
          }

          this.bufferSignal.set(buffer);

          if (this.autoplay) {
            this.audioPlayer.startAutoplay(this.autoplayRepeat);
          }

          this.cdr.markForCheck();
        }, () => {
          this.onError();
        });
      }
    }
  }

  resize() {
    this.spectrogramComponent.resize();
  }

  setAudioLoading(loading: boolean) {
    this.loading = loading;
    this.audioLoading.emit(loading);
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

  onSpectrogramZoomEnd(area: AudioViewerArea) {
    this.audioViewerView.setMode('default');
    this.audioViewerView.setView(area);
  }

  onSpectrogramDrawEnd(area: AudioViewerArea) {
    this.drawEnd.emit({
      xRange: area.xRange,
      yRange: area.yRange
    });
  }

  private onError() {
    this.hasError = true;
    this.setAudioLoading(false);
    this.cdr.markForCheck();
  }
}
