import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'laji-taxon-image',
  template: '<div class="img-container" *ngIf="image"><img [src]="image"></div>',
  styles: [`
    .img-container {
      width: 100%;
      text-align: center;
      margin-bottom: 10px;
      background-color: #2c2c2c;
    }
  `]
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
