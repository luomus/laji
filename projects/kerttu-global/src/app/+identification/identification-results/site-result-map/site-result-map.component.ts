import { Component, OnChanges, ChangeDetectionStrategy, Input, SimpleChanges, ViewChild } from '@angular/core';
import { IGlobalSite, IIdentificationSiteStat } from '../../../kerttu-global-shared/models';
import { LajiMapDataOptions, LajiMapOptions, LajiMapTileLayerName } from '@laji-map/laji-map.interface';
import { LajiMapComponent } from '@laji-map/laji-map.component';
import * as L from 'leaflet';
import { GetPopupOptions } from 'laji-map';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'bsg-site-result-map',
  templateUrl: './site-result-map.component.html',
  styleUrls: ['./site-result-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiteResultMapComponent implements OnChanges {
  @ViewChild(LajiMapComponent) lajiMap: LajiMapComponent;
  @Input() sites: IGlobalSite[] = [];
  @Input() siteStats: IIdentificationSiteStat[] = [];

  mapOptions: LajiMapOptions = {
    tileLayerName: LajiMapTileLayerName.openStreetMap,
    controls: { draw: false, location: false, layer: false },
    draw: {},
    popupOnHover: true
  };

  legendList: { label: string; color: string }[];
  countByLegend: Record<string, number> = {};

  private legendThresholds = [0, 1, 10, 100];
  private legendLabels = ['0', '1-', '10-', '100-'];
  private legendColors = ['rgb(169, 169, 169, 0.6)', 'rgba(110, 204, 57, 0.6)', 'rgba(240, 194, 12, 0.6)', 'rgba(241, 128, 23, 0.6)'];

  constructor(
    private translate: TranslateService
  ) {
    this.legendList = this.legendLabels.map((label, i) => ({
      label,
      color: this.legendColors[i]
    }));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.sites && this.siteStats) {
      this.countByLegend = this.getCountByLegend(this.sites, this.siteStats);

      const data = this.getData(this.sites, this.siteStats);
      this.lajiMap.setData(data || {});
      this.lajiMap.map.zoomToData({ padding: [40, 40] });
    }
  }

  private getCountByLegend(sites: IGlobalSite[], siteStats: IIdentificationSiteStat[]): Record<string, number> {
    const countByLegend = {};
    this.legendLabels.forEach(label => {
      countByLegend[label] = 0;
    });

    siteStats.forEach(stat => {
      let legendIdx: number;
      for (let i = 0; i < this.legendThresholds.length; i++) {
        if (stat.count >= this.legendThresholds[i]) {
          legendIdx = i;
        } else {
          break;
        }
      }
      countByLegend[this.legendLabels[legendIdx]] += 1;
    });

    countByLegend['0'] = sites.length - siteStats.length;
    countByLegend['total'] = sites.length;

    return countByLegend;
  }

  private getData(sites: IGlobalSite[], siteStats: IIdentificationSiteStat[]): LajiMapDataOptions {
    const countBySite = {};
    (siteStats || []).forEach(stat => {
      countBySite[stat.siteId] = stat.count;
    });

    return {
      featureCollection: {
        type: 'FeatureCollection',
        features: (sites || []).map(site => ({
          type: 'Feature',
          geometry: site.geometry,
          properties: {
            id: site.id,
            name: site.name,
            country: site.country,
            count: countBySite[site.id] || 0
          }
        }))
      },
      cluster: {
        singleMarkerMode: true,
        maxClusterRadius: 20,
        iconCreateFunction: this.iconCreateFunction
      },
      getPopup: this.getPopup.bind(this)
    };
  }

  private iconCreateFunction(cluster: any) {
    const markers = cluster.getAllChildMarkers();
    const counts = markers.map(marker => marker.feature.properties.count);
    const count = counts.reduce((sum, curr) => (sum + curr), 0);

    let c = ' marker-cluster-';
    if (count === 0) {
      c += 'empty';
    } else if (count < 10) {
      c += 'small';
    } else if (count < 100) {
      c += 'medium';
    } else {
      c += 'large';
    }

    return new L.DivIcon({ html: '<div><span style="white-space: nowrap">' + count + '</span></div>',
      className: 'marker-cluster' + c, iconSize: new L.Point(40, 40) });
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
}
