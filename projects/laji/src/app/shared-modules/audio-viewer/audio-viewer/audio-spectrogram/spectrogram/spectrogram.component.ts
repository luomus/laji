import { Component, ChangeDetectionStrategy, ViewChild, ElementRef, Input, SimpleChanges, OnChanges, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { Subscription, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AudioViewerArea, SpectrogramConfig } from '../../../models';
import { AudioService } from '../../../service/audio.service';
import { SpectrogramService } from '../../../service/spectrogram.service';
import { getMaxFreq } from '../../../service/audio-viewer-utils';

@Component({
  selector: 'laji-spectrogram',
  templateUrl: './spectrogram.component.html',
  styleUrls: ['./spectrogram.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpectrogramComponent implements OnChanges {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() buffer?: AudioBuffer;
  @Input() config?: SpectrogramConfig;

  @Input() view?: AudioViewerArea;
  @Input() defaultView?: AudioViewerArea;

  @Input() width = 0;
  @Input() height = 0;

  @Input() pregeneratedSpectrogramUrl?: string;

  @Output() spectrogramLoading = new EventEmitter<boolean>();

  private defaultViewImageDataCache?: ImageData|null;
  private spectrogramCreateSub?: Subscription;

  constructor(
    private audioService: AudioService,
    private spectrogramService: SpectrogramService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.buffer || changes.config || changes.defaultView) {
      this.defaultViewImageDataCache = null;
    }

    if (
      changes.buffer || changes.config || changes.view || changes.pregeneratedSpectrogramUrl
    ) {
      this.clearCanvas();

      if (this.spectrogramCreateSub) {
        this.spectrogramCreateSub.unsubscribe();
      }

      if (this.buffer && this.view) {
        const observable: Observable<null> = this.pregeneratedSpectrogramUrl ? of(null) : this.createSpectrogram(
          this.buffer, this.view
        );
        // has a timeout because otherwise the changes caused by this.spectrogramLoading.emit() are not always detected
        setTimeout(() => {
          this.spectrogramLoading.emit(true);
          this.spectrogramCreateSub = observable.subscribe(() => {
            this.spectrogramLoading.emit(false);
            this.cdr.markForCheck();
          });
        }, 0);
      }
    }
  }

  private createSpectrogram(buffer: AudioBuffer, view: AudioViewerArea): Observable<null> {
    const isDefaultView = (
      view.xRange[0] === this.defaultView?.xRange[0] && view.xRange[1] === this.defaultView.xRange?.[1] &&
      view.yRange[0] === this.defaultView?.yRange[0] && view.yRange[1] === this.defaultView.yRange?.[1]
    );

    if (isDefaultView && this.defaultViewImageDataCache) {
      this.drawImage(this.defaultViewImageDataCache, this.canvasRef.nativeElement);
      return of(null);
    }

    buffer = this.processBuffer(buffer, view);

    return this.getSpectrogramImageData(buffer).pipe(
      tap(result => {
        if (isDefaultView) {
          this.defaultViewImageDataCache = result;
        }
        this.drawImage(result, this.canvasRef.nativeElement);
      }),
      map(() => null)
    );
  }

  private processBuffer(buffer: AudioBuffer, view: AudioViewerArea): AudioBuffer {
    if (view.xRange[0] !== 0 || view.xRange[1] !== buffer.duration) {
      return this.audioService.extractSegment(buffer, view.xRange[0], view.xRange[1]);
    }
    return buffer;
  }

  private getSpectrogramImageData(buffer: AudioBuffer): Observable<ImageData> {
    return this.spectrogramService.getSpectrogramImageData(buffer, this.config);
  }

  private drawImage(data: ImageData, canvas: HTMLCanvasElement) {
    const maxFreq = getMaxFreq(this.buffer!.sampleRate);

    const startFreq = this.view?.yRange?.[0] || 0;
    const endFreq = this.view?.yRange?.[1] || maxFreq;

    const ratioY1 = startFreq / maxFreq;
    const ratioY2 = endFreq / maxFreq;
    const startY = data.height - (data.height * ratioY2);

    canvas.width = data.width;
    canvas.height = data.height * (ratioY2 - ratioY1);

    const ctx = canvas.getContext('2d');
    ctx?.putImageData(data, 0, -startY, 0, startY, canvas.width, canvas.height);
  }

  private clearCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  }
}
