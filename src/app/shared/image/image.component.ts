import { Component, OnInit, AfterViewInit, ElementRef, Inject, Input } from '@angular/core';
import * as OpenSeadragon from 'openseadragon';

@Component({
  selector: 'laji-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.css']
})
export class ImageComponent implements OnInit, AfterViewInit {

  @Input() src: string;
  @Input() showNavigator = true;
  @Input() navigatorPosition = 'BOTTOM_RIGHT';

  constructor(private el: ElementRef) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    OpenSeadragon({
      element: this.el.nativeElement,
      animationTime: 0.7,
      prefixUrl: '/js/opensea/images/',
      showNavigator: this.showNavigator,
      navigatorPosition: this.navigatorPosition,
      maxZoomPixelRatio: 2,
      tileSources: [{
        type: 'legacy-image-pyramid',
        levels: [{
          url: this.src
        }]
      }]
    });
  }

}
