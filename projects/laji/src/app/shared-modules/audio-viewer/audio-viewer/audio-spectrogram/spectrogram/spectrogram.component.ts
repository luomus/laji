import { Component, ChangeDetectionStrategy, ViewChild, ElementRef, Input, SimpleChanges, OnChanges, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { Subscription, Observable, of } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { IAudioViewerArea, ISpectrogramConfig } from '../../../models';
import { AudioViewerUtils } from '../../../service/audio-viewer-utils';
import { AudioService } from '../../../service/audio.service';
import { SpectrogramService } from '../../../service/spectrogram.service';

@Component({
  selector: 'laji-spectrogram',
  templateUrl: './spectrogram.component.html',
  styleUrls: ['./spectrogram.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpectrogramComponent implements OnChanges {
  @ViewChild('canvas', { static: true }) canvasRef: ElementRef<HTMLCanvasElement>;

  @Input() buffer: AudioBuffer;
  @Input() startTime: number;
  @Input() endTime: number;
  @Input() config: ISpectrogramConfig;

  @Input() view: IAudioViewerArea;

  @Input() width = 0;
  @Input() height = 0;

  @Input() pregeneratedSpectrogramUrl?: string;

  @Output() spectrogramLoading = new EventEmitter<boolean>();

  private imageData?: ImageData;
  private imageDataSub?: Subscription;

  constructor(
    private audioService: AudioService,
    private spectrogramService: SpectrogramService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes.buffer || changes.startTime || changes.endTime || changes.pregeneratedSpectrogramUrl || (
      changes.config && this.spectrogramNeedsToBeRecreatedOnConfigChange(changes.config.currentValue, changes.config.previousValue)
    )) {
      this.imageData = null;
      this.clearCanvas();

      if (this.imageDataSub) {
        this.imageDataSub.unsubscribe();
      }

      if (this.buffer && this.startTime != null && this.endTime != null) {
        const observable = this.pregeneratedSpectrogramUrl ? of(null) : this.createSpectrogram(
          this.buffer, this.startTime, this.endTime
        );
        // has a timeout because otherwise the changes caused by this.spectrogramLoading.emit() are not always detected
        setTimeout(() => {
          this.spectrogramLoading.emit(true);
          this.imageDataSub = observable.subscribe(() => {
            this.spectrogramLoading.emit(false);
            this.cdr.markForCheck();
          });
        }, 0);
      }
    } else if (changes.view) {
      if (this.imageData) {
        this.drawImage(this.imageData, this.canvasRef.nativeElement);
      }
    }
  }

  private spectrogramNeedsToBeRecreatedOnConfigChange(currConfig?: ISpectrogramConfig, prevConfig?: ISpectrogramConfig): boolean {
    if (!currConfig || !prevConfig) {
      return true;
    }
    if (Object.keys(currConfig).length !== Object.keys(prevConfig).length) {
      return true;
    }

    return Object.keys(currConfig).some(key => key !== 'sampleRate' && currConfig[key] !== prevConfig[key]);
  }

  private createSpectrogram(buffer: AudioBuffer, startTime: number, endTime: number): Observable<void> {
    buffer = this.processBuffer(buffer, startTime, endTime);
    return this.createSpectrogramFromProcessedBuffer(buffer);
  }

  private processBuffer(buffer: AudioBuffer, startTime: number, endTime: number): AudioBuffer {
    if (startTime !== 0 || endTime !== buffer.duration) {
      buffer = this.audioService.extractSegment(buffer, startTime, endTime);
    }
    return buffer;
  }

  private createSpectrogramFromProcessedBuffer(buffer: AudioBuffer): Observable<void> {
    return this.spectrogramService.getSpectrogramImageData(buffer, this.config)
      .pipe(
        tap(result => {
          this.imageData = result;
          this.drawImage(this.imageData, this.canvasRef.nativeElement);
        }),
        map(() => null)
      );
  }

  private drawImage(data: ImageData, canvas: HTMLCanvasElement) {
    const maxTime = this.endTime - this.startTime;
    const maxFreq = AudioViewerUtils.getMaxFreq(this.buffer.sampleRate);

    const startTime = this.view?.xRange[0] ? this.view?.xRange[0] - this.startTime : 0;
    const endTime = this.view?.xRange[1] ? this.view?.xRange[1] - this.startTime : maxTime;
    const startFreq = this.view?.yRange[0] || 0;
    const endFreq = this.view?.yRange[1] || maxFreq;

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
