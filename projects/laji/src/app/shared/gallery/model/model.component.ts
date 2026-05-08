import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'laji-image-modal-model',
    template: `<laji-model-viewer [src]="src"></laji-model-viewer>`,
    styleUrls: ['./model.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ImageModalModelComponent {
  @Input() src!: string;
}
