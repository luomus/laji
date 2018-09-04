import { Input, Component, OnInit } from '@angular/core';
import { Image } from '../../../shared/image-gallery/image.interface';

@Component({
  selector: 'laji-print-images',
  templateUrl: './print-images.component.html',
  styleUrls: ['./print-images.component.css']
})
export class PrintImagesComponent implements OnInit {
  @Input() images: Image[];

  constructor() { }

  ngOnInit() { }

}
