import { Component, ChangeDetectionStrategy, ViewChild, TemplateRef, Input, Output, EventEmitter } from '@angular/core';
import { IAudioViewerArea, ISpectrogramConfig } from '../../../shared-modules/audio-viewer/models';
import { IKerttuAudio } from '../models';

@Component({
  selector: 'laji-kerttu-audio-viewer',
  templateUrl: './kerttu-audio-viewer.component.html',
  styleUrls: ['./kerttu-audio-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KerttuAudioViewerComponent {
  @Input() audio: IKerttuAudio;

  @Input() focusArea: IAudioViewerArea;
  @Input() highlightFocusArea = false;

  @Input() zoomTime = false;
  @Input() timePaddingOnZoom = 1;
  @Input() zoomFrequency = false;
  @Input() frequencyPaddingOnZoom = 500;

  @Input() autoplay = false;
  @Input() autoplayRepeat = 1;

  @Input() showZoomControl = false; // zoom control allows the user to zoom into spectrogram

  @Input() spectrogramConfig: ISpectrogramConfig = {
    sampleRate: 22050,
    nperseg: 256,
    noverlap: 256 - 160,
    nbrOfRowsRemovedFromStart: 2,
    maxNbrOfColsForNoiseEstimation: 6000,
    noiseReductionParam: 2,
    logRange: 3
  };

  @Output() audioLoading = new EventEmitter<boolean>();

  @ViewChild('audioInfo', { static: true }) audioInfoTpl: TemplateRef<any>;
}
