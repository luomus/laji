import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'laji-annotation-images',
  templateUrl: './annotation-images.component.html',
  styleUrls: ['./annotation-images.component.scss']
})
export class AnnotationImagesComponent implements OnInit {

  @Input() image: any;

  constructor() { }

  ngOnInit() {
  }

}
