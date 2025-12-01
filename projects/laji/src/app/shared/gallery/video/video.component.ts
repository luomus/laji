import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Image } from '../image-gallery/image.interface';

@Component({
    selector: 'laji-image-modal-video',
    template: `<video autoplay loop muted [src]="source.videoURL"></video>`,
    styleUrls: ['./video.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ImageModalVideoComponent {
  @Input() source!: Partial<Image>;
}
