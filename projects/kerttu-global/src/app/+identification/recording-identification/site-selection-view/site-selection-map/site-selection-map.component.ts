import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, NgZone, ViewChild, SimpleChanges, OnChanges } from '@angular/core';
import { IGlobalSite } from '../../../../kerttu-global-shared/models';
import { LajiMapDataOptions, LajiMapOptions, LajiMapTileLayerName } from '@laji-map/laji-map.interface';
import { LajiMapComponent } from '@laji-map/laji-map.component';
import { Polygon } from 'geojson';
import { GetPopupOptions } from 'laji-map';
import { TranslateService } from '@ngx-translate/core';

interface LajiMapData extends LajiMapDataOptions {
  groupContainer: any;
}

@Component({
  selector: 'bsg-site-selection-map',
  templateUrl: './site-selection-map.component.html',
  styleUrls: ['./site-selection-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiteSelectionMapComponent implements OnChanges {
  @ViewChild(LajiMapComponent) lajiMap: LajiMapComponent;
  @Input() sites: IGlobalSite[] = [];
  @Input() selectedSites: number[] = [];
  @Input() height = '100%';

  mapOptions: LajiMapOptions = {
    tileLayerName: LajiMapTileLayerName.openStreetMap,
    controls: { draw: false, location: false, layer: false },
    draw: {},
    popupOnHover: true
  };

  @Output() selectedSitesChange = new EventEmitter<number[]>();

  private data: LajiMapData;
  private defaultColor = '#888';
  private partlyActiveColor = '#d1c400';
  private activeColor = '#00aa00';

  constructor(
    private translate: TranslateService,
    private ngZone: NgZone
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.sites) {
      const data = this.getData(this.sites);
      this.lajiMap?.setData(data || {});

      this.lajiMap?.map?.zoomToData({ padding: [40, 40] });

      const lajiMapData = this.lajiMap?.map?.getData();
      if (lajiMapData?.length > 0) {
        this.data = lajiMapData[0];
        this.data.groupContainer.on('clusterclick', (event) => {
          this.ngZone.run(() => {
            const markers = event.layer.getAllChildMarkers();
            const siteIds = markers.map(marker => marker.feature.properties.id);
            this.addOrRemoveSites(siteIds);
          });
        });
      } else {
        this.data = null;
      }
    } else if (changes.selectedSites) {
      this.data?.groupContainer.refreshClusters();
    }
  }

  drawToMap(type: 'Rectangle' = 'Rectangle') {
    this.lajiMap.drawToMap(type);
  }

  abortDrawing() {
    if (this.lajiMap?.map) {
      this.lajiMap.map.abortDrawing({});
      this.lajiMap.map.clearDrawData();
    }
  }

  onCreate(rect?: Polygon) {
    if (rect) {
      const sites = this.getSitesInsideRectangle(rect);
      this.addOrRemoveSites(sites.map(site => site.id));
      this.abortDrawing();
    }
  }

  private getData(sites: IGlobalSite[]): LajiMapDataOptions {
    return {
      on: {
        click: (event, data) => {
          this.ngZone.run(() => {
            const id = data.feature.properties.id;
            this.addOrRemoveSite(id);
          });
        }
      },
      getClusterStyle: this.getClusterStyle.bind(this),
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
        singleMarkerMode: true,
        maxClusterRadius: 20,
        zoomToBoundsOnClick: false,
      },
      getPopup: this.getPopup.bind(this)
    };
  }

  private getClusterStyle(count: number, indices: number[]) {
    const sites = this.sites.filter((site, idx) => indices.includes(idx)).filter(
      site => this.selectedSites?.includes(site.id)
    );

    const color = sites.length === count ? this.activeColor : sites.length > 0 ? this.partlyActiveColor : this.defaultColor;

    return {
      weight: 2,
      opacity: 1,
      fillOpacity: 0,
      color
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

  private addOrRemoveSites(ids: number[]) {
    const allSelected = ids.every(id => this.selectedSites.includes(id));

    if (allSelected) {
      this.selectedSites = this.selectedSites.filter(id => !ids.includes(id));
    } else {
      ids.forEach(id => {
        if (!this.selectedSites.includes(id)) {
          this.selectedSites = [...this.selectedSites, id];
        }
      })
    }

    this.selectedSitesChange.emit(this.selectedSites);
  }

  private addOrRemoveSite(id: number) {
    const filteredSites = this.selectedSites.filter(site => site !== id);

    if (this.selectedSites.length > filteredSites.length) {
      this.selectedSites = filteredSites;
    } else {
      this.selectedSites = [...filteredSites, id];
    }

    this.selectedSitesChange.emit(this.selectedSites);
  }

  private getSitesInsideRectangle(rect: Polygon): IGlobalSite[] {
    return this.sites.reduce((res, site) => {
      if (this.pointIsInsideBox(site.geometry.coordinates, rect.coordinates[0])) {
        res.push(site);
      }
      return res;
    }, []);
  }

  private pointIsInsideBox(point: number[], box: number[][]): boolean {
    const bottomLeft = box[0];
    const topRight = box[2];

    // in case longitude 180 is inside the box
    let longIsInRange = false;
    if (topRight[1] < bottomLeft[1]) {
      longIsInRange = point[1] >= bottomLeft[1] || point[1] <= topRight[1];
    } else {
      longIsInRange = point[1] >= bottomLeft[1] && point[1] <= topRight[1];
    }
    return point[0] >= bottomLeft[0] && point[0] <= topRight[0] && longIsInRange;
  }

}
