import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'laji-taxon-image',
  template: '<img [src]="image" *ngIf="image">'
})
export class TaxonImageComponent implements OnInit {

  image;

  constructor() { }

  ngOnInit() {
  }

  @Input()
  set images(images: any[]) {
    if (images && images[0]) {
      this.image = images[0].thumbnailURL || images[0].fullURL;
    } else {
      this.image = '';
    }
  }

}
