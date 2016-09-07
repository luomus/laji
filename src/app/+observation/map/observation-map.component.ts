import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {MapComponent} from "../../shared/map/map.component";
import {WarehouseApi} from "../../shared/api/WarehouseApi";
import {SearchQuery} from "../search-query.model";
import {Subscription} from "rxjs";

declare var d3:any;
let observationMapColorScale;

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
  ) {

  }

  ngOnInit() {
    this.subQueryChange = this.searchQuery.queryUpdated$.subscribe(() => this.updateMapData() );
    this.updateMapData();
  }

  pickLocation(e) {
    if (e.layer && e.layer.feature && e.layer.feature.geometry && e.layer.feature.geometry.coordinates && e.layer.feature.geometry.coordinates.length > 0) {
      let coordinates = e.layer.feature.geometry.coordinates;
      this.searchQuery.query.coordinates = [[
        coordinates[0][0][1],
        coordinates[0][2][1],
        coordinates[0][0][0],
        coordinates[0][2][0]
      ].join(':') + ':WGS84'];
      this.searchQuery.queryUpdate({formSubmit: true});
    }
  }

  private updateMapData() {
    let query = Object.assign({}, this.searchQuery.query);
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
      if (maxIndividuals < agg.count) {
        maxIndividuals = agg.count;
      }
      features.push({
        "type": "Feature",
        "properties":{
          "title": agg.count
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            coords
          ]
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
        title:string
      }
    };
    featureIdx:number
  }) {
    let color = "#0a0";
    if (
      data.feature.properties.title
    ) {
      color = observationMapColorScale(data.feature.properties.title);
    }
    return {
      weight: 1,
      opacity: 1,
      fillOpacity: .5,
      color: color
    }
  }
}
