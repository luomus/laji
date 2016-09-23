import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {WarehouseApi} from "../../shared/api/WarehouseApi";
import {Subscription} from "rxjs";
import {Util} from "../../shared/service/util.service";
import {WarehouseQueryInterface} from "../../shared/model/WarehouseQueryInterface";
import LatLngBounds = L.LatLngBounds;

@Component({
  selector: 'laji-observation-map',
  templateUrl: 'observation-map.component.html'
})
export class ObservationMapComponent implements OnInit {

  @Input() visible:boolean = false;
  @Input() query:WarehouseQueryInterface;
  @Input() opacity:number = .5;
  @Input() lat:string[] = ['gathering.conversions.wgs84Grid05.lat', 'gathering.conversions.wgs84Grid01.lat'];
  @Input() lon:string[] = ['gathering.conversions.wgs84Grid1.lon', 'gathering.conversions.wgs84Grid01.lon'];
  @Input() zoomThresholds:number[] = [5]; // zoom levels from lowest to highest when to move to more accurate grid
  @Input() onlyViewPortThreshold:number = 0; // when active level is higher or equal to this will be using viewport coordinates to show grid
  @Input() size:number = 10000;
  @Input() draw:boolean = false;
  @Input() height:number;
  @Input() selectColor:string = '#00aa00';
  @Input() color:string|string[] = ['#ffffb2','#fecc5c', '#fd8d3c', '#f03b20', '#bd0026'];
  @Input() colorThresholds = [ 10, 100, 1000, 10000 ]; // 0-10 color[0], 11-100 color[1] etc and 1001+ color[4]
  @Output() create = new EventEmitter();

  public mapData;
  public drawData:any = {featureCollection: {type: "featureCollection", features: []}};
  private prev:string = '';
  private subDataFetch: Subscription;
  private style:(count:number)=>string;
  private lastQuery:WarehouseQueryInterface;
  private viewBound:LatLngBounds;
  private activeLevel = 0;
  private activeBounds:LatLngBounds;

  constructor(private warehouseService:WarehouseApi) { }

  ngOnInit() {
    this.lastQuery = JSON.stringify(this.query);
    this.updateMapData();
    this.initColorScale();
  }

  ngDoCheck() {
    let cacheKey = JSON.stringify(this.query);
    if (this.lastQuery == cacheKey) {
      return;
    }
    this.lastQuery = cacheKey;
    this.updateMapData();
  }

  onCreate(e) {
    this.create.emit(e);
  }

  onMove(e) {
    let curActive = this.activeLevel;
    this.viewBound = e.bounds;
    this.activeLevel = 0;
    for(let i = 0, len = this.zoomThresholds.length; i < len; i++) {
      if (this.zoomThresholds[i] < e.zoom) {
        this.activeLevel = i + 1;
      }
    }
    if (
      curActive !== this.activeLevel ||
      (this.activeLevel >= this.onlyViewPortThreshold && (!this.activeBounds || !this.activeBounds.contains(e.bounds)))
    ) {
      this.activeBounds = e.bounds.pad(0.3);
      this.updateMapData();
    }
  }

  private initColorScale() {
    if (this.color instanceof String) {
      this.style = _ => {
        return String(this.color);
      }
    } else {
      let i, len = this.colorThresholds.length;
      this.style = (count) => {
        for (i = 0; i < len; i++) {
          if (count <= this.colorThresholds[i]) {
            return this.color[i];
          }
        }
        return this.color[len];
      };
    }
  }

  private initDrawData() {
    this.drawData.getFeatureStyle = () => {
      return {
        weight: 2,
        opacity: 1,
        fillOpacity: 0,
        color: this.selectColor
      }
    };
    if (!this.query.coordinates) {
      return;
    }
    let features = [];
    this.query.coordinates.map(coord => {
      let parts = coord.split(':');
      let system = parts.pop();
      if (system === 'WGS84' && parts.length == 4) {
        features.push(this.getFeature({
          type: "Polygon",
          coordinates: [[
            [parts[2], parts[0]], [parts[2], parts[1]],
            [parts[3], parts[1]], [parts[3], parts[0]],
            [parts[2], parts[0]]
          ]]
        }));
      }
    });
    if (features.length) {
      this.drawData.featureCollection.features = features
    }
  }

  private getFeature(geometry:Object) {
    return {
      type: "Feature",
      geometry: geometry
    }
  }

  private updateMapData() {
    let query = Util.clone(this.query);
    let cacheKey = this.getCacheKey(query);
    if (this.prev === cacheKey) {
      return;
    }
    this.prev = cacheKey;
    if (this.subDataFetch) {
      this.subDataFetch.unsubscribe();
    }
    this.drawData.featureCollection.features = [];
    if (query.coordinates) {
      this.initDrawData();
    }
    if (!query.coordinates && this.activeBounds && this.activeLevel >= this.onlyViewPortThreshold) {
      query.coordinates = [
        this.activeBounds.getSouthWest().lat + ':' + this.activeBounds.getNorthEast().lat + ':' +
        this.activeBounds.getSouthWest().lng + ':' + this.activeBounds.getNorthEast().lng + ':WGS84'
      ];
    }
    this.subDataFetch = this.warehouseService.warehouseQueryAggregateGet(
      query, [this.lat[this.activeLevel] + ',' + this.lon[this.activeLevel]],
      undefined, this.size, undefined, true
    ).subscribe(
      (data) => {
        if (data.featureCollection) {
          this.mapData = [{
            featureCollection: data.featureCollection,
            getFeatureStyle: this.getStyle.bind(this)
          }];
        }
      }
    );
  }

  private getCacheKey(query:WarehouseQueryInterface) {
    let cache = JSON.stringify(query);
    if (!this.activeBounds || this.activeLevel < this.onlyViewPortThreshold) {
      return cache;
    }
    return cache + this.activeBounds.toBBoxString() + this.activeLevel;
  }

  private getStyle(data:StyleParam) {
    let currentColor = "#00aa00";
    if (data.feature.properties.title) {
      currentColor = this.style(+data.feature.properties.title);
    }
    return {
      weight: 1,
      opacity: 1,
      fillOpacity: this.opacity,
      color: currentColor
    }
  }
}

interface StyleParam {
  dataIdx:number;
  feature:{
    geometry:any;
    properties:{title:string}
  };
  featureIdx:number
}
