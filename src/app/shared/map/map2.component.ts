import {
  AfterViewInit,
  Component,
  ElementRef, EventEmitter,
  Input,
  OnChanges,
  OnDestroy, Output,
  ViewChild
} from '@angular/core';
import { LajiExternalService } from '../service/laji-external.service';

export interface LajiMapOptions {
  tileLayerName?: string;
  zoom?: number;
  center?: [number, number];
  lang?: string;
  data?: any;
  draw?: any;
  lineTransect?: {
    feature: any;
  };
  markerPopupOffset?: number;
  featurePopupOffset?: number;
  controlSettings?: {
    draw?: boolean;
    drawCopy?: boolean;
    drawClear?: boolean;
    coordinates?: boolean;
    lineTransect?: boolean;
    coordinateInput?: boolean;
  };
}

@Component({
  selector: 'laji-map2',
  template: `
<div class="laji-map-wrap" [ngClass]="{'no-controls': !showControls}">
  <div #lajiMap class="laji-map"></div>
  <div class="loading-map loading" *ngIf="loading"></div>
  <ng-content></ng-content>
</div>`,
  styleUrls: ['./map.component.css'],
  providers: []
})
export class Map2Component implements OnDestroy, OnChanges, AfterViewInit {

  @Input() data: any = [];
  @Input() options: LajiMapOptions = {};
  @Input() loading = false;
  @Input() showControls = true;
  @ViewChild('lajiMap') elemRef: ElementRef;

  lajiMap: any;

  constructor(
    private lajiExternalService: LajiExternalService
  ) {

  }

  ngAfterViewInit() {
    const options = Object.assign({}, this.options, {rootElem: this.elemRef.nativeElement});
    this.lajiMap = this.lajiExternalService.getMap(options);
  }

  ngOnDestroy() {
    this.lajiMap.destroy();
  }

  ngOnChanges(changes) {
    if (changes.data) {
      this.setData(this.data);
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
    if (!this.lajiMap || !this.data) {
      return;
    }
    this.lajiMap.setData(data);
  }
}
