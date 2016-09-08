import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {MapComponent} from "../../shared/map/map.component";
import {WarehouseApi} from "../../shared/api/WarehouseApi";
import {SearchQuery} from "../search-query.model";
import {Subscription} from "rxjs";
import {Util} from "../../shared/service/util.service";
import {WarehouseQueryInterface} from "../../shared/model/WarehouseQueryInterface";
import {CoordinateService} from "../../shared/service/coordinate.service";

declare var d3:any;
let observationMapColorScale;

@Component({
  moduleId: module.id,
  selector: 'laji-observation-map',
  templateUrl: 'observation-map.component.html',
  directives: [MapComponent]
})
export class ObservationMapComponent implements OnInit {

  @Input() visible:boolean = false;
  @Input() color:any;
  @Input() selectColor:string = '#009900';
  @Input() query:WarehouseQueryInterface;
  @Input() opacity:number = .5;
  @Input() lat:string = 'gathering.conversions.wgs84Grid05.lat';
  @Input() lon:string = 'gathering.conversions.wgs84Grid1.lon';
  @Input() size:number = 1000;
  @Input() disableSelect:boolean = false;
  @Input() height:number;
  @Output() select = new EventEmitter();
  public mapData;

  private prev:string = '';
  private subDataFetch: Subscription;
  private style:(count:number)=>string;
  private lastQuery:WarehouseQueryInterface;

  constructor(private warehouseService:WarehouseApi) { }

  ngOnInit() {
    this.lastQuery = JSON.stringify(this.query);
    this.updateMapData();
  }

  ngDoCheck() {
    let cacheKey = JSON.stringify(this.query);
    if (this.lastQuery == cacheKey) {
      return;
    }
    this.lastQuery = cacheKey;
    this.updateMapData();
  }

  onSelect(e) {
    this.select.emit(e);
  }

  private updateMapData() {
    let query = Util.clone(this.query);
    if (query.coordinates) {
      delete query.coordinates;
    }
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
      this.size
    ).subscribe(
      (data) => this.dataToGeo(data.results)
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

  private dataToGeo(data) {
    let features = [];
    let maxIndividuals = 0;
    let selected = this.query.coordinates ? this.query.coordinates.slice(0) : [];
    let latStep = this.getStepping(this.lat);
    let lonStep = this.getStepping(this.lon);
    data.map((agg) => {
      let lat = parseFloat(agg['aggregateBy'][this.lat]);
      let lon = parseFloat(agg['aggregateBy'][this.lon]);
      if (!lat || !lon) {
        return;
      }
      let coords = [[
        [lon, lat],
        [lon, lat + latStep],
        [lon + lonStep, lat + latStep],
        [lon + lonStep, lat],
        [lon, lat]
      ]];
      if (maxIndividuals < agg.count) {
        maxIndividuals = agg.count;
      }
      let select = false;
      if (selected.length > 0) {
        let idx = selected.indexOf(CoordinateService.getWarehouseQuery(coords));
        if (idx > -1) {
          selected.splice(idx, 1);
          select = true;
        }
      }
      features.push({
        "type": "Feature",
        "properties":{"title": agg.count, "selected": select },
        "geometry": {"type": "Polygon", "coordinates": coords }
      });
    });
    let colorType = typeof this.color;
    if (colorType === 'string') {
      this.style = () => {
        return this.color;
      }
    } else {
      this.style = d3.scale.threshold()
        .domain([
          maxIndividuals*.2,
          maxIndividuals*.4,
          maxIndividuals*.6,
          maxIndividuals*.8,
          maxIndividuals+1
        ])
        .range(['#ffffb2','#fecc5c', '#fd8d3c', '#f03b20', '#bd0026']);
    }

    this.mapData = [{
      featureCollection: {
        type: "featureCollection",
        features: features
      },
      getFeatureStyle: this.getStyle.bind(this)
    }];
  }

  private getStyle(data:StyleParam) {
    let currentColor = "#00aa0", origColor = "#00aa0";
    if (data.feature.properties.title) {
      currentColor = origColor = this.style(+data.feature.properties.title);
    }
    if (data.feature.properties.selected) {
      currentColor = this.selectColor;
    }
    return {
      weight: 1,
      opacity: 1,
      fillOpacity: this.opacity,
      origColor: origColor,
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
