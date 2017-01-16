import { Component, AfterViewInit, ElementRef, Input, OnDestroy, OnChanges } from '@angular/core';
import * as OpenSeadragon from 'openseadragon';

@Component({
  selector: 'laji-image',
  template: '',
  styleUrls: ['./image.component.css']
})
export class ImageComponent implements AfterViewInit, OnDestroy, OnChanges {

  @Input() src: string;
  @Input() showNavigator = true;

  private viewer: any;

  constructor(private el: ElementRef) { }

  ngAfterViewInit() {
    this.updateImage();
  }

  ngOnDestroy() {
    this.destroy();
  }

  ngOnChanges() {
    this.updateImage();
  }

  private destroy() {
    if (this.viewer) {
      this.viewer.destroy();
    }
  }

  private updateImage() {
    if (!this.src) {
      return;
    }
    this.destroy();
    this.viewer = OpenSeadragon({
      element: this.el.nativeElement,
      animationTime: 0.7,
      prefixUrl: '/static/images/openseadragon/',
      showNavigator: this.showNavigator,
      navigatorPosition: 'ABSOLUTE',
      navigatorTop: '35px',
      navigatorLeft: '4px',
      navigatorHeight: '100px',
      navigatorWidth: '133px',
      maxZoomPixelRatio: 2,
      tileSources: [{
        type: 'image',
        url: this.src
      }]
    });
  }

}
