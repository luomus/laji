import { Input, Component, OnInit } from '@angular/core';
import { Image } from '../../../shared/model/Image';

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
