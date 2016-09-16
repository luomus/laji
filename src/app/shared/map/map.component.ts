/// <reference path="../../../../typings/globals/leaflet/index.d.ts" />

import {
  Component, OnInit, ElementRef, Inject, OnDestroy, Input, Output, EventEmitter, OnChanges,
  ViewChild
} from '@angular/core';

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
  @Input() visible: boolean;
  @Input() disableSelect:boolean = false;

  @Output() select = new EventEmitter();
  @ViewChild('map') elemRef: ElementRef;

  map:any;


  ngAfterViewInit() {
    this.map = new LajiMap({
      activeIdx: 0,
      zoom: 1,
      data: [],
      rootElem: this.elemRef.nativeElement,
      controlSettings: {
        draw: false,
        layers: true,
        zoom: true,
        location: false
      }
    });
    this.updateData();
  }

  onClick(elem) {

  }

  ngOnDestroy() {
    this.map.destroy();
  }

  ngOnChanges(changes) {
    this.updateData();
  }

  updateData() {
    if (!this.map) {
      return;
    }
    this.map.map.off('click');
    this.map.setData(this.data);
    if (!this.disableSelect && this.map.dataLayerGroups && this.map.dataLayerGroups[0]) {
      this.map.dataLayerGroups[0].addEventListener({
        click: e => {
          this.select.emit(e);
        }
      })
    }
    if (this.visible) {
      setTimeout(() => {
        try {
          this.map.map.invalidateSize();
        } catch (e) {}
      }, 500);
    }
  }
}
