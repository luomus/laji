import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, NgZone, ViewChild } from '@angular/core';
import { IGlobalSite } from '../../../../kerttu-global-shared/models';
import { LajiMapDataOptions, LajiMapOptions, LajiMapTileLayerName } from '@laji-map/laji-map.interface';
import { LajiMapComponent } from '@laji-map/laji-map.component';
import { Polygon } from 'geojson';
import { GetPopupOptions } from 'laji-map';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'bsg-site-selection-map',
  templateUrl: './site-selection-map.component.html',
  styleUrls: ['./site-selection-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiteSelectionMapComponent {
  @ViewChild(LajiMapComponent) lajiMap: LajiMapComponent;
  @Input() color = '#00aa00';

  mapOptions: LajiMapOptions = {
    tileLayerName: LajiMapTileLayerName.openStreetMap,
    controls: { draw: false, location: false, layer: false },
    draw: {},
    popupOnHover: true
  };

  data: LajiMapDataOptions;

  @Output() siteSelect = new EventEmitter<number[]>();

  private _sites: IGlobalSite[];

  @Input() set sites(sites: IGlobalSite[]) {
    this.data = this.getData(sites);
    this._sites = sites;
  }

  constructor(
    private translate: TranslateService,
    private ngZone: NgZone
  ) { }

  drawToMap(type: 'Rectangle' = 'Rectangle') {
    this.lajiMap.drawToMap(type);
  }

  abortDrawing() {
    if (this.lajiMap && this.lajiMap.map) {
      this.lajiMap.map.abortDrawing({});
      this.lajiMap.map.clearDrawData();
    }
  }

  onCreate(rect?: Polygon) {
    if (rect) {
      const sites = this.getSitesInsideRectangle(rect);
      this.siteSelect.emit(sites.map(site => site.id));
    }
  }

  private getData(sites: IGlobalSite[]): LajiMapDataOptions {
    return {
      on: {
        click: (event, data) => {
          this.ngZone.run(() => {
            this.siteSelect.emit([data.feature.properties.id]);
          });
        }
      },
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
        features: (sites || []).map(site => ({
          type: 'Feature',
          geometry: site.geometry,
          properties: {
            id: site.id,
            name: site.name,
            country: site.country
          }
        }))
      },
      cluster: {
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: true,
        singleMarkerMode: true,
        maxClusterRadius: 20
      },
      getPopup: this.getPopup.bind(this)
    };
  }

  private getPopup(options: GetPopupOptions, callback: (content: (string | HTMLElement)) => void): string {
    const siteTranslation = this.translate.instant('identification.siteSelection.site');
    const data = options.feature.properties;

    let popup = '<strong>' + siteTranslation + ' ' + data.id + '</strong><br>' + data.name;
    if (data.country) {
      popup += ', ' + data.country;
    }
    return popup;
  }

  private getSitesInsideRectangle(rect: Polygon): IGlobalSite[] {
    const longtitudes = rect.coordinates[0].map(c => c[0]);
    const latitudes = rect.coordinates[0].map(c => c[1]);
    const lonMin = Math.min(...longtitudes);
    const lonMax = Math.max(...longtitudes);
    const latMin = Math.min(...latitudes);
    const latMax = Math.max(...latitudes);

    return this._sites.reduce((res, site) => {
      const [lon, lat] = site.geometry.coordinates;

      if (lon >= lonMin && lon <= lonMax && lat >= latMin && lat <= latMax) {
        res.push(site);
      }

      return res;
    }, []);
  }
}
