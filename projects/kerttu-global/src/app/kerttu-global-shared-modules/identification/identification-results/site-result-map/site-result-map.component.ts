import { Component, OnChanges, ChangeDetectionStrategy, Input, ViewChild } from '@angular/core';
import { IGlobalSite, IIdentificationSiteStat } from '../../../../kerttu-global-shared/models';
import { LajiMapComponent } from 'projects/laji/src/app/shared-modules/laji-map/laji-map.component';
import type { DivIcon } from 'leaflet';
import { DataOptions, Options, TileLayerName, GetPopupOptions } from '@luomus/laji-map/lib/defs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'bsg-site-result-map',
  templateUrl: './site-result-map.component.html',
  styleUrls: ['./site-result-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiteResultMapComponent implements OnChanges {
  @ViewChild(LajiMapComponent) lajiMap!: LajiMapComponent;
  @Input() sites: IGlobalSite[] = [];
  @Input() siteStats: IIdentificationSiteStat[] = [];

  mapOptions: Options = {
    tileLayerName: TileLayerName.openStreetMap,
    controls: { draw: false, location: false, layer: false },
    draw: {},
    popupOnHover: true
  };

  legendList: { label: string; color: string }[];
  countByLegend: Record<string, number> = {};

  private legendThresholds = [0, 1, 10, 100, 1000];
  private legendLabels = ['0', '1-', '10-', '100-', '1000-'];
  private legendColors = ['rgb(169, 169, 169, 0.6)', 'rgba(241, 128, 23, 0.6)', 'rgba(240, 194, 12, 0.6)', 'rgba(110, 204, 57, 0.6)', 'rgba(137, 94, 213, 0.6)'];

  private dataInitialized = false;

  constructor(
    private translate: TranslateService
  ) {
    this.legendList = this.legendLabels.map((label, i) => ({
      label,
      color: this.legendColors[i]
    }));
  }

  ngOnChanges() {
    if (this.sites && this.siteStats) {
      this.countByLegend = this.getCountByLegend(this.sites, this.siteStats);

      if (this.lajiMap?.map) {
        this.updateMapData();
        this.dataInitialized = true;
      }
    }
  }

  onMapLoaded() {
    if (!this.dataInitialized) {
      this.updateMapData();
      this.dataInitialized = true;
    }
  }

  private updateMapData() {
    const data = this.getData(this.sites, this.siteStats);
    this.lajiMap.setData(data || {});
    this.lajiMap.map.zoomToData({ padding: [40, 40] });
  }

  private getCountByLegend(sites: IGlobalSite[], siteStats: IIdentificationSiteStat[]): Record<string, number> {
    const countByLegend: Record<string, number> = {};
    this.legendLabels.forEach(label => {
      countByLegend[label] = 0;
    });

    siteStats.forEach(stat => {
      let legendIdx = 0;
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

  private getData(sites: IGlobalSite[], siteStats: IIdentificationSiteStat[]): DataOptions {
    const countBySite: Record<string, number> = {};
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

  private iconCreateFunction(cluster: any): DivIcon {
    const markers = cluster.getAllChildMarkers();
    const counts = markers.map((marker: any) => marker.feature.properties.count);
    const count = counts.reduce((sum: number, curr: number) => (sum + curr), 0);

    let c = ' marker-cluster-';
    if (count === 0) {
      c += 'empty';
    } else if (count < 10) {
      c += 'large'; // red
    } else if (count < 100) {
      c += 'medium'; // yellow
    } else if (count < 1000) {
      c += 'small'; // green
    } else {
      c += 'purple'; // purple
    }

    return new (window.L.DivIcon)({ html: '<div><span style="white-space: nowrap">' + count + '</span></div>',
      className: 'marker-cluster' + c, iconSize: new (window.L.Point)(40, 40) });
  }

  private getPopup(options: GetPopupOptions, callback: (content: (string | HTMLElement)) => void): string {
    const siteTranslation = this.translate.instant('siteSelection.site');
    const data = options.feature!.properties!;

    let popup = '<strong>' + siteTranslation + ' ' + data.id + '</strong><br>' + data.name;
    if (data.country) {
      popup += ', ' + data.country;
    }
    return popup;
  }
}
