import { Component, ChangeDetectionStrategy, ViewChild, ElementRef, Input, SimpleChanges, OnChanges, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';
import { IAudioViewerArea, ISpectrogramConfig } from '../../../models';
import { AudioViewerUtils } from '../../../service/audio-viewer-utils';
import { SpectrogramService } from '../../../service/spectrogram.service';

@Component({
  selector: 'laji-spectrogram',
  templateUrl: './spectrogram.component.html',
  styleUrls: ['./spectrogram.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpectrogramComponent implements OnChanges {
  @ViewChild('canvas', {static: true}) canvasRef: ElementRef<HTMLCanvasElement>;

  @Input() buffer: AudioBuffer;
  @Input() config: ISpectrogramConfig;

  @Input() visibleArea?: IAudioViewerArea;

  @Input() width?: number;
  @Input() height?: number;

  @Output() spectrogramReady = new EventEmitter();

  imageData: ImageData;

  private imageDataSub: Subscription;

  constructor(
    private spectrogramService: SpectrogramService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.buffer || changes.config) {
      this.imageData = null;
      this.clearCanvas();

      if (this.imageDataSub) {
        this.imageDataSub.unsubscribe();
      }

      if (this.buffer) {
        this.imageDataSub = this.spectrogramService.getSpectrogramImageData(this.buffer, this.config)
          .pipe(delay(0))
          .subscribe((result) => {
            this.imageData = result;
            this.drawImage(this.imageData, this.canvasRef.nativeElement);
            this.spectrogramReady.emit();
            this.cdr.markForCheck();
          });
      }
    } else if (changes.visibleArea) {
      if (this.imageData) {
        this.drawImage(this.imageData, this.canvasRef.nativeElement);
      }
    }
  }

  private drawImage(data: ImageData, canvas: HTMLCanvasElement) {
    const [maxTime, maxFreq] = AudioViewerUtils.getMaxTimeAndFreq(this.buffer, this.config.sampleRate);

    const startTime = this.visibleArea?.xRange[0] || 0;
    const endTime = this.visibleArea?.xRange[1] || maxTime;
    const startFreq = this.visibleArea?.yRange[0] || 0;
    const endFreq = this.visibleArea?.yRange[1] || maxFreq;

    const ratioX1 = startTime / maxTime;
    const ratioX2 = endTime / maxTime;
    const startX = data.width * ratioX1;

    const ratioY1 = startFreq / maxFreq;
    const ratioY2 = endFreq / maxFreq;
    const startY = data.height - (data.height * ratioY2);

    canvas.width = data.width * (ratioX2 - ratioX1);
    canvas.height = data.height * (ratioY2 - ratioY1);

    const ctx = canvas.getContext('2d');
    ctx.putImageData(data, -startX, -startY, startX, startY, canvas.width, canvas.height);
  }

  private clearCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}
