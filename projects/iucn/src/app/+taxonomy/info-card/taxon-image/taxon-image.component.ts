import { Component, Input } from '@angular/core';

@Component({
    selector: 'iucn-taxon-image',
    template: '@if (image) {<div class="img-container"><img [src]="image"></div>}',
    styles: [`
    .img-container {
      width: 100%;
      text-align: center;
      margin-bottom: 10px;
      background-color: #2c2c2c;
    }
  `],
    standalone: false
})
export class TaxonImageComponent {

  image: any;

  @Input()
  set images(images: any[]) {
    if (images && images[0]) {
      this.image = images[0].thumbnailURL || images[0].fullURL;
    } else {
      this.image = '';
    }
  }

}
