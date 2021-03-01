import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { Image } from './image.interface';
import { DocumentViewerChildComunicationService } from '../../../shared-modules/document-viewer/document-viewer-child-comunication.service';

@Component({
  selector: 'laji-image-gallery-overlay',
  styleUrls: ['./image-modal.component.css'],
  templateUrl: './image-modal-overlay.component.html'
})
export class ImageModalOverlayComponent {
  public img: Image;
  public currentImageIndex: number;
  public close: Function;
  public modalImages: Image[];
  public loading;
  public showLinkToSpeciesCard: boolean;
  @Output() cancelEvent = new EventEmitter<any>();

  constructor(
   private childComunication: DocumentViewerChildComunicationService
  ) { }

  closeGallery() {
    if (this.close) {
      this.close();
    }
    this.cancelEvent.emit(null);
    this.childComunication.emitChildEvent(false);
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
    this.childComunication.emitChildEvent(true);
  }

  handleLoading(loading) {
    setTimeout(() => {
      this.loading = loading;
    }, 200);
  }

  @HostListener('document:keydown', ['$event'])
  modalKeyDown(e: KeyboardEvent)  {
    e.preventDefault();
    if (e.keyCode === 27) { // esc
      e.preventDefault();
      this.closeGallery();
    }
    if (e.keyCode === 37 && this.modalImages.length > 0 && this.currentImageIndex > this.modalImages.length - 1) { // left
      e.preventDefault();
      this.prevImage();
    }
    if (e.keyCode === 39 && this.modalImages.length > 0 && this.currentImageIndex > 0) { // right
      e.preventDefault();
      this.nextImage();
    }
    e.stopPropagation();
  }
}
