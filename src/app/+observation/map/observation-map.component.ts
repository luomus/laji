import {Component, OnInit} from '@angular/core';
import {MapComponent} from "../../shared/map/map.component";
import {WarehouseApi} from "../../shared/api/WarehouseApi";
import {SearchQuery} from "../search-query.model";
import {Subscription} from "rxjs";

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

  public mapData;

  private subDataFetch: Subscription;
  private subQueryChange: Subscription;

  constructor(
    private warehouseService:WarehouseApi,
    public searchQuery: SearchQuery
  ) {

  }

  ngOnInit() {
    this.subQueryChange = this.searchQuery.queryUpdated$.subscribe( );
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
    let result = [];

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
      result.push({
        "type": "Feature",
        "properties":{
          "title": agg['individualCountSum']
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            coords
          ]
        }
      });
    });
    this.mapData = result;
  }

  /*

   aggregateBy:
   gathering.conversions.wgs84Grid1.lat: "60.0"
   gathering.conversions.wgs84Grid05.lon: "24.5"
   count: 1546003
   individualCountMax: 10000
   individualCountSum: 3535655

   {"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[22.207004189222086,60.47430300256853]}},
   {"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[22.311658377997933,60.43453495634962]}},
   {
   "type": "Feature",
   "properties": {},
   "geometry": {
   "type": "Point",
   "coordinates": [
   22.104264017028992,
   60.40403173483798
   ],
   "radius": 1955.2645542879416
   }
   }
   */

}
