import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Image } from '../image-gallery/image.interface';

@Component({
  selector: 'laji-image-modal-video',
  template: `<video autoplay loop muted [src]="source.videoURL"></video>`,
  styleUrls: ['./video.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageModalVideoComponent {
  @Input() source!: Image;
}
