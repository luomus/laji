import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {MapComponent} from "../../shared/map/map.component";
import {WarehouseApi} from "../../shared/api/WarehouseApi";
import {SearchQuery} from "../search-query.model";
import {Subscription} from "rxjs";
import {Util} from "../../shared/service/util.service";

declare var d3:any;
let observationMapColorScale;
let observationMapSelectedColor = '#009900';

@Component({
  moduleId: module.id,
  selector: 'laji-observation-map',
  templateUrl: 'observation-map.component.html',
  directives: [MapComponent],
  styles: [`
.observation-map {
  height: 800px;
  width: 100%;
}
`]
})
export class ObservationMapComponent implements OnInit {

  @Input() visible:boolean = false;
  @Output() select = new EventEmitter();
  public mapData;

  private prev:string = '';
  private subDataFetch: Subscription;
  private subQueryChange: Subscription;

  constructor(
    private warehouseService:WarehouseApi,
    public searchQuery: SearchQuery
  ) { }

  ngOnInit() {
    this.subQueryChange = this.searchQuery.queryUpdated$.subscribe(() => this.updateMapData() );
    this.updateMapData();
  }

  pickLocation(e) {
    if (e.layer.feature.properties.selected) {
      e.layer.setStyle({ color: e.layer.options.origColor });
      e.layer.feature.properties.selected = false;
      this.searchQuery.query.coordinates = undefined;
    } else {
      this.searchQuery.query.coordinates = [];
      e.target.eachLayer((layer) => {
        if (layer.feature.properties.selected) {
          layer.feature.properties.selected = false;
          layer.setStyle({ color: layer.options.origColor })
        }
      });
      e.layer.setStyle({ color: observationMapSelectedColor });
      e.layer.feature.properties.selected = true;
      if (
        e.layer.feature &&
        e.layer.feature.geometry &&
        e.layer.feature.geometry.coordinates &&
        e.layer.feature.geometry.coordinates.length > 0
      ) {
        this.searchQuery.query.coordinates.push(this.getCoordinateFilter(e.layer.feature.geometry.coordinates));
      }
    }
    this.searchQuery.queryUpdate({formSubmit: true});
  }

  private getCoordinateFilter(coordinates) {
    return [
        coordinates[0][0][1],
        coordinates[0][2][1],
        coordinates[0][0][0],
        coordinates[0][2][0]
      ].join(':') + ':WGS84';
  }

  private updateMapData() {
    let query = Util.clone(this.searchQuery.query);
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
      ['gathering.conversions.wgs84Grid05.lat,gathering.conversions.wgs84Grid1.lon'],
      undefined,
      1000
    ).subscribe(
      (data) => this.dataToGeo(data.results)
    );
  }

  private dataToGeo(data) {
    let features = [];
    let maxIndividuals = 0;
    let selected = this.searchQuery.query.coordinates ? this.searchQuery.query.coordinates.slice(0) : [];
    data.map((agg) => {
      let lat = parseFloat(agg['aggregateBy']['gathering.conversions.wgs84Grid05.lat']);
      let lon = parseFloat(agg['aggregateBy']['gathering.conversions.wgs84Grid1.lon']);
      if (!lat || !lon) {
        return;
      }
      let coords = [];
      coords.push([lon, lat]);
      coords.push([lon, lat + 0.5]);
      coords.push([lon + 1, lat + 0.5]);
      coords.push([lon + 1, lat]);
      coords.push([lon, lat]);
      coords = [coords];
      if (maxIndividuals < agg.count) {
        maxIndividuals = agg.count;
      }
      let select = false;
      if (selected.length > 0) {
        let idx = selected.indexOf(this.getCoordinateFilter(coords));
        if (idx > -1) {
          selected.splice(idx, 1);
          select = true;
        }
      }
      features.push({
        "type": "Feature",
        "properties":{
          "title": agg.count,
          "selected": select
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": coords
        }
      });
    });
    observationMapColorScale = d3.scale.threshold()
      .domain([
        maxIndividuals*.2,
        maxIndividuals*.4,
        maxIndividuals*.6,
        maxIndividuals*.8,
        maxIndividuals+1
      ])
      .range(['#ffffb2','#fecc5c', '#fd8d3c', '#f03b20', '#bd0026']);

    this.mapData = [{
      featureCollection: {
        type: "featureCollection",
        features: features
      },
      getFeatureStyle: this.getStyle
    }];
  }

  getStyle(data:{
    dataIdx:number;
    feature:{
      geometry:any;
      properties:{
        title:string,
        selected:boolean
      }
    };
    featureIdx:number
  }) {
    let currentColor = "#00aa0", origColor = "#00aa0";
    if (data.feature.properties.title) {
      currentColor = origColor = observationMapColorScale(data.feature.properties.title);
    }
    if (data.feature.properties.selected) {
      currentColor = observationMapSelectedColor;
    }
    return {
      weight: 1,
      opacity: 1,
      fillOpacity: .5,
      origColor: origColor,
      color: currentColor
    }
  }
}
