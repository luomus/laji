import { Component, Input, Output, ElementRef, EventEmitter, OnInit, HostListener } from '@angular/core';
import { Image } from './image.interface';

/**
 * Originally from here https://github.com/vimalavinisha/angular2-image-popup
 *
 * Added features:
 *  * keyboard actions for left right and esc PR#9
 *
 * Changes:
 *  * using taxonomyImage result instead of generic one
 *  * removed dependency on font-awesome
 *  * style fixes
 *
 * Original license:
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 vimalavinisha
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * This is modified to out needs
 */

@Component({
  selector: 'laji-image-gallery',
  styleUrls: ['./image-modal.component.css'],
  templateUrl: './image-modal.component.html'
})
export class ImageModalComponent implements OnInit {
  public _element: any;
  public opened: boolean = false;
  public img: Image;
  public currentImageIndex: number;
  public loading: boolean= false;
  public showRepeat: boolean= false;
  @Input('modalImages') public modalImages: Image[];
  @Input('imagePointer') public imagePointer: number;
  @Output('cancelEvent') cancelEvent = new EventEmitter<any>();

  constructor(public element: ElementRef) {
    this._element = this.element.nativeElement;
  }

  ngOnInit() {
    this.loading = true;
    if (this.imagePointer >= 0) {
      this.showRepeat = false;
      this.openGallery(this.imagePointer);
    } else {
      this.showRepeat = true;
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e) {
    if (!this.opened) {
      return;
    }
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
    this.opened = false;
    this.cancelEvent.emit(null);
  }

  prevImage() {
    this.loading = true;
    this.currentImageIndex--;
    if (this.currentImageIndex < 0) {
      this.currentImageIndex = this.modalImages.length - 1;
    }
    this.openGallery(this.currentImageIndex);
  }

  nextImage() {
    this.loading = true;
    this.currentImageIndex++;
    if (this.modalImages.length === this.currentImageIndex) {
      this.currentImageIndex = 0;
    }
    this.openGallery(this.currentImageIndex);
  }

  openGallery(index) {
    if (!index) {
      this.currentImageIndex = 1;
    }
    this.currentImageIndex = index;
    this.opened = true;
    for (let i = 0; i < this.modalImages.length; i++) {
      if (i === this.currentImageIndex ) {
        this.img = this.modalImages[i];
        this.loading = false;
        break;
      }
    }
  }
}
