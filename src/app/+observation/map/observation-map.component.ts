import {Component, OnInit, Input} from '@angular/core';
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

  public mapData;

  private spots:any[];
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

  private updateMapData() {
    this.subDataFetch = this.warehouseService.warehouseQueryAggregateGet(
      this.searchQuery.query,
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
      console.log(agg);
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
    observationMapColorScale = d3.scale.quantize()
      .domain([
        0,
        100,
        1000,
        10000,
        100000
      ])
      .range(["#c0ffff","#80ff40", "#ffff00", '#ff8000', '#c00000']);

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
      fillOpacity: .3,
      color: color
    }
  }
}
