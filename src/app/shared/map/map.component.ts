/// <reference path="../../../../typings/globals/leaflet/index.d.ts" />

import {
  Component, OnInit, ElementRef, Inject, OnDestroy, Input, Output, EventEmitter, OnChanges,
  ViewChild
} from '@angular/core';
import {timeout} from "rxjs/operator/timeout";

let LajiMap = require('laji-map').default;

@Component({
  selector: 'laji-map',
  template: `
<div style="width:100%; height: 100%;">
  <div #map style="height:100%;width:100%"></div>
</div>`,
  providers: []
})
export class MapComponent implements OnDestroy, OnChanges {

  @Input() data: any = {};

  @Output() onSelect = new EventEmitter();
  @ViewChild('map') elemRef: ElementRef;

  map:any;


  ngAfterViewInit() {
    this.map = new LajiMap({
      activeIdx: null,
      zoom: 3,
      data: this.data,
      rootElem: this.elemRef.nativeElement
    });
    console.log(this.map.drawnItems);
  }

  ngOnDestroy() {
  }

  ngOnChanges() {
    if (!this.map) {
      return;
    }
    this.map.map.invalidateSize();
  }

}
