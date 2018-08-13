import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { Image } from './image.interface';

@Component({
  selector: 'laji-image-gallery-overlay',
  styleUrls: ['./image-modal.component.css'],
  templateUrl: './image-modal-overlay.component.html'
})
export class ImageModalOverlayComponent implements OnInit {
  public img: Image;
  public currentImageIndex: number;
  public close: Function;
  public modalImages: Image[];
  public loading;
  public showLinkToSpeciesCard: boolean;
  @Output('cancelEvent') cancelEvent = new EventEmitter<any>();

  constructor() {

  }

  ngOnInit() {
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e) {
    e.stopPropagation();
    if (e.keyCode === 27) { // esc
      this.closeGallery();
    }
    if (e.keyCode === 37) { // left
      this.prevImage();
    }
    if (e.keyCode === 39) { // right
      this.nextImage();
    }
  }

  closeGallery() {
    if (this.close) {
      this.close();
    }
    this.cancelEvent.emit(null);
  }

  prevImage() {
    this.currentImageIndex--;
    if (this.currentImageIndex < 0) {
      this.currentImageIndex = this.modalImages.length - 1;
    }
    this.showImage(this.currentImageIndex);
  }

  nextImage() {
    this.currentImageIndex++;
    if (this.modalImages.length === this.currentImageIndex) {
      this.currentImageIndex = 0;
    }
    this.showImage(this.currentImageIndex);
  }

  showImage(index) {
    if (!index) {
      this.currentImageIndex = 1;
    }
    this.currentImageIndex = index;
    if (this.modalImages[index]) {
      this.img = this.modalImages[index];
    }
  }

  handleLoading(loading) {
    setTimeout(() => {
      this.loading = loading;
    }, 200);
  }
}
