import {AfterViewInit, Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild, ChangeDetectorRef} from '@angular/core';
import {LajiMapOptions, LajiMapTileLayerName} from '@laji-map/laji-map.interface';
import {LajiMapComponent} from '@laji-map/laji-map.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {Taxonomy} from '../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-gbif-map',
  templateUrl: './gbif-map.component.html',
  styleUrls: ['./gbif-map.component.scss']
})
export class GbifMapComponent implements OnChanges, AfterViewInit, OnDestroy {
  @ViewChild(LajiMapComponent) mapComponent: LajiMapComponent;

  @Input() taxon: Taxonomy;
  @Input() height = '605px';

  mapOptions: LajiMapOptions = {
    controls: {
      draw: false
    },
    zoom: 2,
    draw: false,
    center: [40, 25],
    tileLayerName: LajiMapTileLayerName.openStreetMap,
    availableTileLayerNamesWhitelist: [
      LajiMapTileLayerName.openStreetMap,
      LajiMapTileLayerName.googleSatellite
    ],
    availableOverlayNameWhitelist: []
  };
  loading = false;

  private layer: any;

  private layerUrl = 'https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@1x.png?' +
    'style=classic.poly&bin=hex&taxonKey=';
  private speciesApiUrl = 'http://api.gbif.org/v1/species/match';

  private getTaxonKeySub: Subscription;

  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.taxon) {
      this.updateData();
    }
  }

  ngAfterViewInit() {
    if (this.layer) {
      this.addLayerToMap();
    }
  }

  ngOnDestroy() {
    if (this.getTaxonKeySub) {
      this.getTaxonKeySub.unsubscribe();
    }
  }

  private updateData() {
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
        headers: new HttpHeaders({'Accept': 'application/json'}),
        responseType: 'text',
        params: this.getTaxonSearchParams()
      })
        .pipe(
          map(data => {
            data = JSON.parse(data);
            if (data && data['matchType'] === 'EXACT') {
              return data['usageKey'];
            }
          })
        )
        .subscribe(key => {
          if (key) {
            this.layer = L.tileLayer(this.layerUrl + key, {zIndex: 1000});
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
    const params = {
      name: this.taxon.scientificName,
      strict: true
    };

    for (const parent of ['kingdom', 'phylum', 'class', 'order', 'family', 'genus']) {
      if (this.taxon.parent && this.taxon.parent[parent]) {
        params[parent] = this.taxon.parent[parent].scientificName;
      }
    }

    return params;
  }

  private addLayerToMap() {
    if (!this.mapComponent || !this.mapComponent.map || !this.mapComponent.map.map) {
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
