import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { IGlobalSite } from '../../../../kerttu-global-shared/models';
import { LajiMapDataOptions, LajiMapOptions, LajiMapTileLayerName } from '@laji-map/laji-map.interface';

@Component({
  selector: 'bsg-site-selection-map',
  templateUrl: './site-selection-map.component.html',
  styleUrls: ['./site-selection-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiteSelectionMapComponent implements OnInit {
  @Input() color = '#00aa00';

  mapOptions: LajiMapOptions = {
    tileLayerName: LajiMapTileLayerName.openStreetMap,
    controls: { location: false }
  };

  data: LajiMapDataOptions;

  @Input() set sites(sites: IGlobalSite[]) {
    this.data = this.getData(sites);
  }


  constructor() { }

  ngOnInit(): void {
  }

  getData(sites: IGlobalSite[]): LajiMapDataOptions {
    return {
      getFeatureStyle: () => {
        return {
          weight: 2,
          opacity: 1,
          fillOpacity: 0,
          color: this.color
        };
      },
      featureCollection: {
        type: 'FeatureCollection',
        features: ([]).map(site => ({
          type: 'Feature',
          geometry: site.geometry,
          properties: {}
        })).concat((sites || []).map(site => ({
          type: 'Feature',
          geometry: {...site.geometry, radius: undefined},
          properties: {}
        })))
      },
      cluster: {
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: true,
        singleMarkerMode: true,
        maxClusterRadius: 20
      }
    };
  }
}
