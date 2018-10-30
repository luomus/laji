import { Component, OnChanges, Input, ViewChild, AfterViewInit } from '@angular/core';
import { WbcResultService, SEASON } from '../../wbc-result.service';
import { WarehouseQueryInterface } from '../../../../../shared/model/WarehouseQueryInterface';
import { YkjMapComponent } from '../../../../../shared-modules/ykj/ykj-map/ykj-map.component';
import 'leaflet.sync';

@Component({
  selector: 'laji-wbc-species-maps',
  templateUrl: './wbc-species-maps.component.html',
  styleUrls: ['./wbc-species-maps.component.css']
})
export class WbcSpeciesMapsComponent implements OnChanges, AfterViewInit {
  @ViewChild('syys') syysMapComponent: YkjMapComponent;
  @ViewChild('talvi') talviMapComponent: YkjMapComponent;
  @ViewChild('kevat') kevatMapComponent: YkjMapComponent;
  @Input() taxonId: string;
  @Input() taxonCensus = undefined;
  @Input() year: number;
  @Input() season: SEASON;
  @Input() birdAssociationArea: string;

  query1: WarehouseQueryInterface;
  query2: WarehouseQueryInterface;
  query3: WarehouseQueryInterface;

  zeroQuery1: WarehouseQueryInterface;
  zeroQuery2: WarehouseQueryInterface;
  zeroQuery3: WarehouseQueryInterface;

  breaks = [0, 1, 2, 8, 32, 128, 512];
  labels = ['0', '1', '2-7', '8-31', '32-127', '128-511', '512-'];
  colorRange = ['#ffffff', 'violet', 'blue', 'lime', 'yellow', 'orange', 'red'];

  private maps: any[];

  constructor(
    private resultService: WbcResultService
  ) { }

  ngOnChanges() {
    if (this.taxonId && this.year) {
      this.setQuerys();
    }
  }

  ngAfterViewInit(): void {
    this.maps = [this.syysMapComponent, this.talviMapComponent, this.kevatMapComponent].map(mapComponent => {
      return mapComponent.mapComponent.map;
    });
    this.maps.forEach(map => this.initEventListeners(map));
  }

  private setQuerys() {
    this.setQuery(1, 'fall');
    this.setQuery(2, 'winter');
    this.setQuery(3, 'spring');
  }

  private setQuery(nbr: number, season: SEASON) {
    const filterParams = this.resultService.getFilterParams(this.year, season, this.birdAssociationArea);
    this['query' + nbr] = {
      ...filterParams,
      taxonId: [this.taxonId]
    };
    this['zeroQuery' + nbr] = {
      ...filterParams,
      taxonCensus: [this.taxonCensus]
    };
  }

  private initEventListeners(lajiMap) {
    const otherMaps = this.maps.filter(_map => lajiMap !== _map);
    otherMaps.forEach(otherMap => {
      lajiMap.map.sync(otherMap.map);
    });
    lajiMap._handling = {};
    const sync = (fn) => (e) => {
      const name = e.type;
      const wasHandling = lajiMap._handling[name];
      if (wasHandling) {
        return;
      }
      lajiMap._handling[name] = true;
      otherMaps.forEach(otherMap => {
        otherMap._handling[name] = true;
        fn(otherMap, e);
      });
      lajiMap._handling[name] = false;
    };
    lajiMap.map.addEventListener({
      tileLayerChange: sync((_map) => _map.setTileLayerByName(lajiMap.tileLayerName)),
      tileLayerOpacityChange: sync((_map) => _map.setTileLayerOpacity(lajiMap.tileLayerOpacity)),
      overlaysChange: sync((_map, e) => _map.setOverlaysByName(e.overlayNames))
    });
  }
}
