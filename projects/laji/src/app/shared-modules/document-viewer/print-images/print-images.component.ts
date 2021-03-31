import { Component, Input } from '@angular/core';
import { Image } from '../../../shared/model/Image';

@Component({
  selector: 'laji-print-images',
  templateUrl: './print-images.component.html',
  styleUrls: ['./print-images.component.css']
})
export class PrintImagesComponent {
  @Input() images: Image[];

}
