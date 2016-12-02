import {
  Component, ElementRef, OnDestroy, Input, Output, EventEmitter, OnChanges, ViewChild,
  OnInit
} from '@angular/core';
import { Logger } from '../logger/logger.service';
import { MapService } from './map.service';

const lajiMap = require('laji-map').default;

@Component({
  selector: 'laji-map',
  template: `
<div style="width:100%; height: 100%; position: relative">
  <div #map style="height:100%;width:100%"></div>
  <ng-content></ng-content>
</div>`,
  providers: []
})
export class MapComponent implements OnDestroy, OnChanges, OnInit {

  @Input() data: any = {};
  @Input() drawData: any;
  @Input() visible: boolean;
  @Input() draw: any = false;
  @Input() lang: string = 'fi';
  @Input() showLayers: boolean = true;
  @Input() drawSingleShape: boolean = true;
  @Input() initWithWorldMap: boolean = false;
  @Input() bringDrawLayerToBack: boolean = true;

  @Output() select = new EventEmitter();
  @Output() onCreate = new EventEmitter();
  @Output() onMove = new EventEmitter();
  @ViewChild('map') elemRef: ElementRef;

  map: any;
  private initSinge = false;

  constructor(
    private mapService: MapService,
    private logger: Logger
  ) {
  }

  ngOnInit() {
    let controlSettings: any = {
      draw: this.draw,
      edit: false,
      layers: true,
      zoom: true,
      location: false,
    };
    if (this.showLayers === false) {
      controlSettings.layer = false;
    }
    this.map = new lajiMap({
      tileLayerName: this.initWithWorldMap ? 'openStreetMap' : 'taustakartta',
      activeIdx: 0,
      zoom: this.initWithWorldMap ? 3 : 1,
      lang: this.lang,
      data: [],
      markerPopupOffset: 5,
      featurePopupOffset: 0,
      enableDrawEditing: false,
      onChange: e => this.onChange(e),
      rootElem: this.elemRef.nativeElement,
      controlSettings: controlSettings
    });
    this.map.map.on('moveend', _ => {
      this.moveEvent('moveend');
    });
    this.map.map.on('movestart', _ => {
      this.moveEvent('movestart');
    });
    this.updateData();
    this.initDrawData();
    this.moveEvent('moveend');
  }

  moveEvent(type: string) {
    this.onMove.emit({
      zoom: this.map.getNormalizedZoom(),
      bounds: this.map.map.getBounds(),
      type: type
    });
  }

  onChange(events) {
    events.map(event => {
      switch (event.type) {
        case 'create':
          this.onCreate.emit(event.feature.geometry);
          break;
        case 'delete':
          this.onCreate.emit();
          break;
        default:
      }
    });
  }

  ngOnDestroy() {
    try {
      this.map.map.off();
      this.map.map.remove();
    } catch (err) {
      this.logger.log('Unmounting map failed', err);
    }
  }

  ngOnChanges(changes) {
    if (changes.visible) {
      setTimeout(() => {
        try {
          if (this.map) {
            this.map.map.invalidateSize();
          }
        } catch (e) {
        }
      }, 200);
    }
    if (changes.data || changes.drawData) {
      this.updateData();
      this.initDrawData();
    }
  }

  updateData() {
    if (!this.map || !this.data) {
      return;
    }
    try {
      this.map.setData(this.data);
      if (this.drawSingleShape) {
        this.initSingleShape();
      }
    } catch (err) {
      this.logger.error('Failed to add map data', err);
    }
  }

  initSingleShape() {
    if (this.initSinge) {
      return;
    }
    try {
      this.map.map.addEventListener({
        'draw:drawstart': event => this.mapService.startDraw()
      });
      this.initSinge = true;
    } catch (err) {
      this.logger.warn('Failed to add event listener', err);
    }
  }

  initDrawData() {
    if (this.map && this.drawData) {
      this.map.setDrawData(this.drawData);
      if (this.bringDrawLayerToBack) {
        this.map.drawLayerGroup.bringToBack();
      }
    }
  }
}
