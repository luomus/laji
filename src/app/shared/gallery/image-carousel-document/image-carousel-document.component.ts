import { Component, OnInit, Input } from '@angular/core';
import { Image } from '../image-gallery/image.interface';

@Component({
  selector: 'laji-image-carousel-document',
  templateUrl: './image-carousel-document.component.html',
  styleUrls: ['./image-carousel-document.component.scss']
})
export class ImageCarouselDocumentComponent implements OnInit {

  @Input() modalImages: Image[];

  mainURL: string;

  constructor() { }

  ngOnInit() {
    this.mainURL = this.modalImages[0].fullURL;
  }

  openMainPic(url) {
    this.mainURL = url;
  }

}
