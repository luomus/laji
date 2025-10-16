import { effect, Signal, signal } from '@angular/core';
import { AudioViewerMode, AudioViewerArea, AudioViewerFocusArea } from '../models';
import { getMaxFreq, getPaddedRange } from './audio-viewer-utils';
import equals from 'deep-equal';

export class AudioViewerView {
  private readonly modeSignal = signal<AudioViewerMode>('default');
  readonly mode = this.modeSignal.asReadonly();

  private readonly activeViewSignal = signal<AudioViewerArea|undefined>(undefined, {equal: equals});
  readonly activeView = this.activeViewSignal.asReadonly();

  private readonly defaultViewSignal = signal<AudioViewerArea|undefined>(undefined, {equal: equals});
  readonly defaultView = this.defaultViewSignal.asReadonly();

  private readonly playAreaSignal = signal<AudioViewerArea|undefined>(undefined, {equal: equals});
  readonly playArea = this.playAreaSignal.asReadonly();

  private readonly buffer: Signal<AudioBuffer|undefined>;
  private readonly minFrequency: Signal<number|undefined>;
  private readonly maxFrequency: Signal<number|undefined>;
  private readonly focusArea: Signal<AudioViewerFocusArea|undefined>;

  constructor(
    buffer: Signal<AudioBuffer|undefined>,
    minFrequency: Signal<number|undefined>,
    maxFrequency: Signal<number|undefined>,
    focusArea: Signal<AudioViewerFocusArea|undefined>
  ) {
    this.buffer = buffer;
    this.minFrequency = minFrequency;
    this.maxFrequency = maxFrequency;
    this.focusArea = focusArea;

    effect(() => {
      const buff = this.buffer();
      if (buff) {
        const defaultView = this.getDefaultView(buff, this.minFrequency(), this.maxFrequency(), this.focusArea());
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

  private getDefaultView(buffer: AudioBuffer, minFrequency?: number, maxFrequency?: number, focusArea?: AudioViewerFocusArea) {
    const minTime = 0;
    const maxTime = buffer.duration;
    const minFreq = minFrequency || 0;
    const maxFreq = maxFrequency || getMaxFreq(buffer.sampleRate);

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
    const xRange = focusArea?.highlight && activeView === defaultView ? focusArea.area.xRange : undefined;
    const yRange = focusArea?.zoomFrequency ? focusArea.area.yRange : undefined;

    return { xRange: xRange || activeView.xRange, yRange: yRange || activeView.yRange };
  }
}
