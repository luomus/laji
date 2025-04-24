import { effect, Signal, signal } from '@angular/core';
import { AudioViewerMode, AudioViewerArea, SpectrogramConfig, AudioViewerFocusArea } from '../models';
import { getMaxFreq, getPaddedRange } from './audio-viewer-utils';


export class AudioViewerView {
  private readonly modeSignal = signal<AudioViewerMode>('default');
  readonly mode = this.modeSignal.asReadonly();

  private readonly activeViewSignal = signal<AudioViewerArea|undefined>(undefined);
  readonly activeView = this.activeViewSignal.asReadonly();

  private readonly defaultViewSignal = signal<AudioViewerArea|undefined>(undefined);
  readonly defaultView = this.defaultViewSignal.asReadonly();

  private readonly playAreaSignal = signal<AudioViewerArea|undefined>(undefined);
  readonly playArea = this.playAreaSignal.asReadonly();

  private readonly buffer: Signal<AudioBuffer|undefined>;
  private readonly spectrogramConfig: Signal<SpectrogramConfig>;
  private readonly focusArea: Signal<AudioViewerFocusArea|undefined>;

  constructor(buffer: Signal<AudioBuffer|undefined>, spectrogramConfig: Signal<SpectrogramConfig>, focusArea: Signal<AudioViewerFocusArea|undefined>) {
    this.buffer = buffer;
    this.spectrogramConfig = spectrogramConfig;
    this.focusArea = focusArea;

    effect(() => {
      const buff = this.buffer();
      if (buff) {
        const defaultView = this.getDefaultView(buff, this.spectrogramConfig(), this.focusArea());
        this.defaultViewSignal.set(defaultView);
        this.activeViewSignal.set(defaultView);
        this.playAreaSignal.set(this.getPlayArea(defaultView, defaultView, this.focusArea()));
      } else {
        this.defaultViewSignal.set(undefined);
        this.activeViewSignal.set(undefined);
        this.playAreaSignal.set(undefined);
      }
      this.modeSignal.set('default');
    }, { allowSignalWrites: true });
  }

  setMode(mode: AudioViewerMode) {
    this.modeSignal.set(mode);
  }

  setView(view: AudioViewerArea) {
    this.activeViewSignal.set(view);
    this.playAreaSignal.set(this.getPlayArea(view, this.defaultView()!, this.focusArea()));
  }

  private getDefaultView(buffer: AudioBuffer, spectrogramConfig: SpectrogramConfig, focusArea?: AudioViewerFocusArea) {
    const minTime = 0;
    const maxTime = buffer.duration;
    const minFreq = spectrogramConfig.minFrequency || 0;
    const maxFreq = getMaxFreq(spectrogramConfig.sampleRate);

    return {
      xRange: getPaddedRange(
        focusArea?.area.xRange, focusArea?.zoomTime ? (focusArea?.timePaddingOnZoom ?? 1) : undefined, minTime, maxTime
      ),
      yRange: getPaddedRange(
        focusArea?.area.yRange, focusArea?.zoomFrequency ? (focusArea?.frequencyPaddingOnZoom ?? 500) : undefined, minFreq, maxFreq
      )
    };
  }

  private getPlayArea(activeView: AudioViewerArea, defaultView: AudioViewerArea, focusArea?: AudioViewerFocusArea): AudioViewerArea {
    const xRange = focusArea?.highlight && activeView === defaultView ? focusArea.area.xRange : activeView.xRange;
    const yRange = focusArea?.zoomFrequency ? focusArea.area.yRange : activeView.yRange;

    return { xRange, yRange };
  }
}
