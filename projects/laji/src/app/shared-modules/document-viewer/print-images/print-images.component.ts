import { Component, Input } from '@angular/core';
import { components } from 'projects/laji-api-client/generated/api';

type Image = components['schemas']['Image'];

@Component({
    selector: 'laji-print-images',
    templateUrl: './print-images.component.html',
    styleUrls: ['./print-images.component.css'],
    standalone: false
})
export class PrintImagesComponent {
  @Input() images?: Image[];

}
