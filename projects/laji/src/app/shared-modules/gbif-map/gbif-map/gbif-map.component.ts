import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { Options, TileLayerName } from '@luomus/laji-map/lib/defs';
import { LajiMapComponent } from 'projects/laji/src/app/shared-modules/laji-map/laji-map.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Taxonomy } from '../../../shared/model/Taxonomy';
import { PlatformService } from '../../../root/platform.service';

@Component({
  selector: 'laji-gbif-map',
  templateUrl: './gbif-map.component.html',
  styleUrls: ['./gbif-map.component.scss']
})
export class GbifMapComponent implements OnChanges, OnDestroy {
  @ViewChild(LajiMapComponent, { static: true }) mapComponent?: LajiMapComponent;

  @Input() taxon!: Taxonomy;
  @Input() height = '605px';
  @Input() set mapOptions(mapOptions: Options) {
    this._mapOptions = {
      ...this._mapOptions,
      ...(mapOptions || {})
    };
  }
  get mapOptions() {
    return this._mapOptions;
  }

  loading = false;

  private _mapOptions: Options = {
    controls: {
      draw: false,
      layer: false
    },
    zoom: -1,
    draw: false,
    center: [40, 25],
    tileLayerName: TileLayerName.openStreetMap,
    availableTileLayerNamesWhitelist: [
      TileLayerName.openStreetMap,
      TileLayerName.googleSatellite
    ],
    availableOverlayNameWhitelist: []
  };

  private layer: any;
  private mapLoaded = false;

  private layerUrl = 'https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@1x.png?' +
    'style=classic.poly&bin=hex&taxonKey=';
  private speciesApiUrl = 'https://api.gbif.org/v1/species/match';

  private getTaxonKeySub?: Subscription;

  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef,
    private platformService: PlatformService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.taxon && this.mapLoaded) {
      this.updateData();
    }
  }

  onMapLoad() {
    this.mapLoaded = true;
    this.updateData();
  }

  ngOnDestroy() {
    if (this.getTaxonKeySub) {
      this.getTaxonKeySub.unsubscribe();
    }
  }

  private updateData() {
    if (!this.platformService.isBrowser) {
      return;
    }

    if (this.getTaxonKeySub) {
      this.getTaxonKeySub.unsubscribe();
    }

    if (this.layer) {
      this.removeLayerFromMap();
      this.layer = undefined;
    }

    if (this.taxon && this.taxon.scientificName) {
      this.loading = true;

      this.getTaxonKeySub = this.http.get(this.speciesApiUrl, {
        headers: new HttpHeaders({Accept: 'application/json'}),
        responseType: 'text',
        params: this.getTaxonSearchParams()
      })
        .pipe(
          map((data: any) => {
            data = JSON.parse(data);
            if (data && data['matchType'] === 'EXACT') {
              return data['usageKey'];
            }
          })
        )
        .subscribe(key => {
          if (key) {
            this.layer = (window as any).L.tileLayer(
              this.layerUrl + key,
              {
                zIndex: 1000,
                attribution: '<a target="_blank" href="https://www.gbif.org/citation-guidelines">GBIF</a>'
              }
            );
            this.addLayerToMap();
          }
          this.loading = false;
          this.cd.markForCheck();
        });
    } else {
      this.loading = false;
    }
  }

  private getTaxonSearchParams(): any {
    const params: any = {
      name: this.taxon.scientificName,
      strict: true
    };

    for (const parent of ['kingdom', 'phylum', 'class', 'order', 'family', 'genus']) {
      if (this.taxon.parent?.[parent]) {
        params[parent] = this.taxon.parent[parent].scientificName;
      }
    }

    return params;
  }

  private addLayerToMap() {
    if (!this.platformService.isBrowser || !this.mapComponent || !this.mapComponent.map || !this.mapComponent.map.map) {
      return;
    }

    this.layer.addTo(this.mapComponent.map.map);
  }

  private removeLayerFromMap() {
    if (!this.mapComponent || !this.mapComponent.map || !this.mapComponent.map.map) {
      return;
    }

    this.mapComponent.map.map.removeLayer(this.layer);
  }
}
