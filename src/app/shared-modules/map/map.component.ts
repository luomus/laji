import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { LajiMapOptions } from '../../shared-modules/map/map-options.interface';
import LajiMap from 'laji-map/lib/map';

@Component({
  selector: 'laji-map3',
  template: `
<div class="laji-map-wrap" [ngClass]="{'no-controls': !showControls}">
  <div #lajiMap class="laji-map"></div>
  <div class="loading-map loading" *ngIf="loading"></div>
  <ng-content></ng-content>
</div>`,
  styleUrls: ['./map.component.css'],
  providers: []
})
export class Map3Component implements OnDestroy, OnChanges, AfterViewInit {

  @Input() data: any = [];
  @Input() options: LajiMapOptions = {};
  @Input() loading = false;
  @Input() showControls = true;
  @Input() maxBounds: [[number, number], [number, number]];
  @Input() tileOpacity: number;

  @ViewChild('lajiMap') elemRef: ElementRef;

  lajiMap: any;

  constructor() { }

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    try {
      this.lajiMap.destroy();
    } catch (e) {}
  }

  ngOnChanges(changes) {
    if (changes.data) {
      this.setData(this.data);
    }
    if ((changes.options || changes.maxBounds) && this.lajiMap) {
      this.initMap();
    }
    if (changes.tileOpacity && this.lajiMap && this.lajiMap.tileLayer) {
      this.lajiMap.tileLayer.setOpacity(typeof this.tileOpacity === 'undefined' ? this.tileOpacity : 1);
    }
  }

  initMap() {
    if (this.lajiMap) {
      this.lajiMap.destroy();
    }
    const options = { ...this.options, ...{rootElem: this.elemRef.nativeElement}};
    this.lajiMap = new LajiMap(options);
    if (this.data) {
      this.lajiMap.setData(this.data);
    }
    if (this.maxBounds) {
      this.lajiMap.map.setMaxBounds(this.maxBounds);
    }
    if (this.tileOpacity) {
      this.lajiMap.tileLayer.setOpacity(this.tileOpacity);
    }
  }

  invalidateSize() {
    try {
      if (this.lajiMap) {
        this.lajiMap.map.invalidateSize();
      }
    } catch (e) {
    }
  }

  setData(data) {
    if (!this.lajiMap || !data) {
      return;
    }
    this.lajiMap.setData(data);
  }
}
