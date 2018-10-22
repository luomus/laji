import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'laji-taxon-image',
  templateUrl: './taxon-image.component.html',
  styleUrls: ['./taxon-image.component.css']
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
