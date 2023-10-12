import { Component, Input } from '@angular/core';
import { Image } from '../image-gallery/image.interface';

@Component({
  selector: 'laji-image-modal-video',
  template: `<video controls><source [src]="source.videoURL"/></video>`,
  styleUrls: ['./video.component.scss']
})
export class ImageModalVideoComponent {
  @Input() source: Image;
}
