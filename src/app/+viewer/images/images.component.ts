import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'laji-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.css']
})
export class ImagesComponent implements OnInit, OnChanges {

  @Input() document: any;

  documentImages = [];
  gatheringImages = [];
  unitImages = [];

  constructor() { }

  ngOnInit() {
    this.initImages();
  }

  ngOnChanges() {
    this.initImages();
  }

  private initImages() {
    if (!this.document) {
      return;
    }
    if (this.document.media) {
      this.documentImages = this.document.media;
    }
    if (this.document.gatherings) {
      this.document.gatherings.map(gathering => {
        if (gathering.media) {
          this.gatheringImages = this.gatheringImages.concat(gathering.media);
        }
        if (gathering.units) {
          gathering.units.map(unit => {
            if (unit.media) {
              this.unitImages = this.unitImages.concat(unit.media);
            }
          });
        }
      });
    }
  }

}
