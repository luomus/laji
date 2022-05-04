import { Component, ChangeDetectionStrategy, ViewChild, ElementRef, Input, SimpleChanges, OnChanges, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { Subscription, Observable, of } from 'rxjs';
import { delay, map, switchMap, tap } from 'rxjs/operators';
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

  @Output() spectrogramReady = new EventEmitter();

  private resampledBufferSampleRate?: number;
  private imageData?: ImageData;
  private imageDataSub?: Subscription;

  constructor(
    private audioService: AudioService,
    private spectrogramService: SpectrogramService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.buffer || changes.startTime || changes.endTime || changes.config || changes.pregeneratedSpectrogramUrl) {
      this.imageData = null;
      this.clearCanvas();

      if (this.imageDataSub) {
        this.imageDataSub.unsubscribe();
      }

      if (this.buffer && this.startTime != null && this.endTime != null) {
        const observable = this.pregeneratedSpectrogramUrl ? of(null) : this.createSpectrogram(
          this.buffer, this.startTime, this.endTime, this.config
        );
        // has a delay because otherwise the changes caused by this.spectrogramReady.emit() are not always detected
        this.imageDataSub = observable.pipe(delay(0)).subscribe(() => {
          this.spectrogramReady.emit();
          this.cdr.markForCheck();
        });
      }
    } else if (changes.view) {
      if (this.imageData) {
        this.drawImage(this.imageData, this.canvasRef.nativeElement);
      }
    }
  }

  private createSpectrogram(buffer: AudioBuffer, startTime: number, endTime: number, config: ISpectrogramConfig): Observable<void> {
    return this.processBuffer(buffer, startTime, endTime, config).pipe(
      switchMap(processedBuffer => this.createSpectrogramFromProcessedBuffer(processedBuffer))
    );
  }

  private processBuffer(buffer: AudioBuffer, startTime: number, endTime: number, config: ISpectrogramConfig): Observable<AudioBuffer> {
    if (startTime !== 0 || endTime !== buffer.duration) {
      buffer = this.audioService.extractSegment(buffer, startTime, endTime);
    }
    return this.audioService.resampleBuffer(buffer, config.sampleRate).pipe(
      tap(processedBuffer => {
        this.resampledBufferSampleRate = processedBuffer.sampleRate;
      })
    );
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
    const maxFreq = AudioViewerUtils.getMaxFreq(this.resampledBufferSampleRate);

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
