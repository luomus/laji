import { Component, ChangeDetectionStrategy, Input, OnChanges, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'laji-spectrogram-canvas',
  templateUrl: './spectrogram-canvas.component.html',
  styleUrls: ['./spectrogram-canvas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpectrogramCanvasComponent implements OnChanges {
  @ViewChild('canvas', {static: true}) canvasRef: ElementRef<HTMLCanvasElement>;

  @Input() imageData: ImageData;
  @Input() startX = 0;
  @Input() width = 0;
  @Input() startY = 0;
  @Input() height = 0;

  @Input() cssWidth = '100%';
  @Input() cssHeight = '100%';

  ngOnChanges(): void {
    if (this.imageData) {
      this.drawImage();
    } else {
      this.clearCanvas();
    }
  }

  private drawImage() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.width;
    canvas.height = this.height;

    const ctx = canvas.getContext('2d');
    ctx.putImageData(this.imageData, -this.startX, -this.startY, this.startX, this.startY, canvas.width, canvas.height);
  }

  private clearCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}
