import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {WarehouseApi} from "../../shared/api/WarehouseApi";
import {Subscription} from "rxjs";
import {Util} from "../../shared/service/util.service";
import {WarehouseQueryInterface} from "../../shared/model/WarehouseQueryInterface";
import {CoordinateService} from "../../shared/service/coordinate.service";

declare var d3:any;

@Component({
  selector: 'laji-observation-map',
  templateUrl: 'observation-map.component.html'
})
export class ObservationMapComponent implements OnInit {

  @Input() visible:boolean = false;
  @Input() color:any = ['#ffffb2','#fecc5c', '#fd8d3c', '#f03b20', '#bd0026'];
  @Input() selectColor:string = '#009900';
  @Input() query:WarehouseQueryInterface;
  @Input() opacity:number = .5;
  @Input() lat:string = 'gathering.conversions.wgs84Grid05.lat';
  @Input() lon:string = 'gathering.conversions.wgs84Grid1.lon';
  @Input() size:number = 10000;
  @Input() draw:boolean = false;
  @Input() height:number;
  @Input() heatThreshholds = [ 1,10,1000,10000,100000 ];
  @Output() create = new EventEmitter();
  public mapData;

  private prev:string = '';
  private subDataFetch: Subscription;
  private style:(count:number)=>string;
  private lastQuery:WarehouseQueryInterface;

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

  private initColorScale() {
    let colorType = typeof this.color;
    if (colorType === 'string') {
      this.style = () => {
        return this.color;
      }
    } else {
      this.style = d3.scale.quantize()
        .domain(this.heatThreshholds)
        .range(this.color);
    }
  }

  private updateMapData() {
    let query = Util.clone(this.query);
    let cacheKey = JSON.stringify(query);
    if (this.prev === cacheKey) {
      return;
    }
    this.prev = cacheKey;
    if (this.subDataFetch) {
      this.subDataFetch.unsubscribe();
    }
    this.subDataFetch = this.warehouseService.warehouseQueryAggregateGet(
      query,
      [this.lat + ',' + this.lon],
      undefined,
      this.size,
      undefined,
      true
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

  private getStepping(field) {
    let step = field.match(/\d+/g);
    if (!step[1]) {
      return 0.1;
    }
    if (step[1].charAt(0) == '0') {
      return (+step[1].substring(1))/10;
    }
    return +step[1];
  }

  private getStyle(data:StyleParam) {
    let currentColor = "#00aa0", origColor = "#00aa0";
    console.log();
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
    properties:{title:string,selected:boolean}
  };
  featureIdx:number
}
