import { Component, ChangeDetectionStrategy, Input, SimpleChanges, OnChanges, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';
import { IAudio, IAudioViewerArea, ISpectrogramConfig } from '../../../models';
import { AudioViewerUtils } from '../../../service/audio-viewer-utils';
import { SpectrogramService } from '../../../service/spectrogram.service';

@Component({
  selector: 'laji-spectrogram',
  templateUrl: './spectrogram.component.html',
  styleUrls: ['./spectrogram.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpectrogramComponent implements OnChanges {
  @Input() audio: IAudio;
  @Input() startTime: number;
  @Input() endTime: number;
  @Input() config: ISpectrogramConfig;

  @Input() view: IAudioViewerArea;

  @Input() width?: number;
  @Input() height?: number;

  @Output() spectrogramReady = new EventEmitter();

  imageData: ImageData;
  canvasCoordinates: {
    startX: number;
    width: number;
    startY: number;
    height: number;
    cssWidth?: string;
    cssHeight?: string;
  }[] = [];

  private imageDataSub: Subscription;

  constructor(
    private spectrogramService: SpectrogramService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.audio || changes.startTime || changes.endTime || changes.config) {
      this.imageData = null;

      if (this.imageDataSub) {
        this.imageDataSub.unsubscribe();
      }

      if (this.audio && this.startTime != null && this.endTime != null) {
        this.imageDataSub = this.spectrogramService.getSpectrogramImageData(this.audio, this.startTime, this.endTime, this.config)
          .pipe(delay(0))
          .subscribe((result) => {
            this.imageData = result;
            this.updateCanvasCoordinates(this.imageData);
            this.spectrogramReady.emit();
            this.cdr.markForCheck();
          });
      }
    } else if (changes.view) {
      if (this.imageData) {
        this.updateCanvasCoordinates(this.imageData);
      }
    }
  }

  private updateCanvasCoordinates(data: ImageData, maxLength = 10000) {
    this.canvasCoordinates = [];

    const maxTime = this.endTime - this.startTime;
    const maxFreq = AudioViewerUtils.getMaxFreq(this.config.sampleRate);

    const startTime = this.view?.xRange[0] ? this.view?.xRange[0] - this.startTime : 0;
    const endTime = this.view?.xRange[1] ? this.view?.xRange[1] - this.startTime : maxTime;
    const startFreq = this.view?.yRange[0] || 0;
    const endFreq = this.view?.yRange[1] || maxFreq;

    const ratioX1 = startTime / maxTime;
    const ratioX2 = endTime / maxTime;
    const startX = Math.floor(data.width * ratioX1);

    const ratioY1 = startFreq / maxFreq;
    const ratioY2 = endFreq / maxFreq;
    const startY = Math.floor(data.height - (data.height * ratioY2));

    const width = Math.ceil(data.width * (ratioX2 - ratioX1));
    const heigth = Math.ceil(data.height * (ratioY2 - ratioY1));

    const lastX = startX + width - 1;
    let partStartX = startX;

    // split image into multiple canvases if it is too big
    while (partStartX < lastX) {
      const partEndX = Math.min(partStartX + maxLength - 1, lastX);
      const partWidth = (partEndX - partStartX + 1);

      this.canvasCoordinates.push({
        startX: partStartX,
        width: partWidth,
        startY: startY,
        height: heigth,
        cssWidth: ((partWidth / width) * 100) + '%',
        cssHeight: '100%'
      });

      partStartX = partEndX + 1;
    }
  }
}
