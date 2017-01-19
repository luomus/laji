import {
  Component, ElementRef, OnDestroy, Input, Output, EventEmitter, OnChanges, ViewChild,
  OnInit
} from '@angular/core';
import { Logger } from '../logger/logger.service';
import { MapService } from './map.service';
import LajiMap from 'laji-map';

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

  @Input() data: any = [];
  @Input() drawData: any;
  @Input() visible: boolean = true;
  @Input() draw: any = false;
  @Input() lang: string = 'fi';
  @Input() center: [number, number];
  @Input() showLayers: boolean = true;
  @Input() initWithWorldMap: boolean = false;
  @Input() bringDrawLayerToBack: boolean = true;

  @Output() select = new EventEmitter();
  @Output() onCreate = new EventEmitter();
  @Output() onMove = new EventEmitter();
  @Output() onFailure =  new EventEmitter();
  @ViewChild('map') elemRef: ElementRef;

  map: any;
  private initEvents = false;
  private failureSend = false;

  constructor(
    private mapService: MapService,
    private logger: Logger
  ) {
  }

  ngOnInit() {
    const controlSettings: any = {
      draw: this.draw,
      edit: false,
      layers: true,
      zoom: true,
      coordinateInput: false,
      location: false,
    };
    if (this.showLayers === false) {
      controlSettings.layer = false;
    }
    this.map = new LajiMap({
      tileLayerName: this.initWithWorldMap ? 'openStreetMap' : 'taustakartta',
      zoom: this.getInitialZoomLevel(),
      center: this.center || [65, 26],
      lang: this.lang,
      data: [],
      draw: {
        data: this.drawData,
        editable: false,
        getDraftStyle: this.getDrawingDraftStyle,
        onChange: e => this.onChange(e),
      },
      markerPopupOffset: 5,
      featurePopupOffset: 0,
      rootElem: this.elemRef.nativeElement,
      controlSettings: {
        draw: false,
        drawCopy: false,
        drawClear: false,
        coordinates: false,
        coordinateInput: false
      }
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

  getDrawingDraftStyle(type): any {
    if (type === 'marker') {
      return {};
    } else {
      return {shapeOptions: {color: '#00aa00', opacity: 1, fillOpacity: 0}};
    }
  }

  drawToMap(type) {
    if (type === 'Coordinates') {
      this.map.openCoordinatesDialog();
    } else if (['Rectangle'].indexOf(type) > -1) {
      new (L as any).Draw[type](this.map.map, this.getDrawingDraftStyle(type))
        .enable();
    }
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
        this.invalidateSize();
      }, 200);
    }
    if (changes.data || changes.drawData) {
      this.updateData();
      this.initDrawData();
    }
  }

  invalidateSize() {
    try {
      if (this.map) {
        this.map.map.invalidateSize();
      }
    } catch (e) {
    }
  }

  updateData() {
    if (!this.map || !this.data) {
      return;
    }
    try {
      this.map.setData(this.data);
      if (this.initEvents) {
        return;
      }
      this.initEvents = true;
      this.map.map.addEventListener({
        'draw:drawstop': event => this.mapService.stopDraw()
      });
      this.map.map.addEventListener({
        'draw:drawstart': event => this.mapService.startDraw()
      });
    } catch (err) {
      if (this.failureSend) {
        this.logger.error('Failed to add map data', {error: err && err.message || 'no data' });
      } else {
        this.onFailure.emit(true);
        this.failureSend = true;
      }
    }
  }

  addData(data) {
    this.map.addData(data);
  }

  initDrawData() {
    if (this.map && this.drawData) {
      this.map.setDrawData(this.drawData);
      if (this.bringDrawLayerToBack) {
        this.map.drawLayerGroup.bringToBack();
      }
    }
  }

  private getInitialZoomLevel() {
    return this.initWithWorldMap ? 3 : 1;
  }
}
