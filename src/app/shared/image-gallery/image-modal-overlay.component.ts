import { Component, Output, EventEmitter, OnInit, HostListener } from '@angular/core';
import { Image } from './image.interface';
import { setTimeout } from 'timers';

@Component({
  selector: 'laji-image-gallery-overlay',
  styleUrls: ['./image-modal.component.css'],
  template: `<div class="ng-overlay">
  <div class="ng-gallery-content">
  <div class="uil-ring-css" *ngIf="loading"><div></div></div>
    <a href="{{img.fullURL || img.largeURL}}" download="{{img.fullURL || img.largeURL}}" class="download-img">
      <i class="glyphicon glyphicon-download-alt"></i>
    </a>
    <a class="close-popup" (click)="closeGallery()"><i class="glyphicon glyphicon-remove"></i></a>
    <a class="nav-left" *ngIf="modalImages.length >1" (click)="prevImage()"><i class="glyphicon glyphicon-chevron-left"></i></a>
    <laji-image 
      id="openseadragon-wrapper" 
      *ngIf="img" 
      (loading)="handleLoading($event)" 
      [src]="img.fullURL || img.largeURL" 
      class="effect"></laji-image>
    <a class="nav-right" *ngIf="modalImages.length > 1" (click)="nextImage()"><i class="glyphicon glyphicon-chevron-right"></i></a>
    <span class="info-text" *ngIf="img">
      <span *ngIf="img.vernacularName">{{img.vernacularName}}</span>
      <span *ngIf="img.vernacularName && img.scientificName">-</span>
      <span *ngIf="img.scientificName"><em>{{img.scientificName}}</em></span>
      <br>
      <span *ngIf="img.author">{{img.author}},</span>
      <span *ngIf="img.copyrightOwner && (!img.author || img.author.indexOf(img.copyrightOwner) === -1)">
        {{img.copyrightOwner}},
      </span>
      <span *ngIf="img.licenseId">{{img.licenseId | toQName | label}}</span>
      <span *ngIf="img.licenseAbbreviation && !img.licenseId">{{img.licenseAbbreviation}}</span>
      <br *ngIf="img.author || img.copyrightOwner || img.licenseId || img.licenseAbbreviation">
      <a *ngIf="img.documentId" routerLink="/observation/list" [queryParams]="{'documentId':img.documentId}">{{img.documentId}}</a>
     ({{ currentImageIndex + 1 }}/{{ modalImages.length }})
     </span>
  </div>
</div>`
})
export class ImageModalOverlayComponent implements OnInit {
  public img: Image;
  public currentImageIndex: number;
  public close: Function;
  public modalImages: Image[];
  public loading;
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
