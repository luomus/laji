import {AfterViewInit, Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild} from '@angular/core';
import {LajiMapOptions, LajiMapTileLayerName} from '@laji-map/laji-map.interface';
import {LajiMapComponent} from '@laji-map/laji-map.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Subscription} from 'rxjs';

@Component({
  selector: 'laji-gbif-map',
  templateUrl: './gbif-map.component.html',
  styleUrls: ['./gbif-map.component.scss']
})
export class GbifMapComponent implements OnChanges, AfterViewInit, OnDestroy {
  @ViewChild(LajiMapComponent) mapComponent: LajiMapComponent;

  @Input() scientificName: string;
  @Input() height = '605px';

  mapOptions: LajiMapOptions = {
    controls: {
      draw: false
    },
    zoom: 0,
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
  private speciesApiUrl = 'http://api.gbif.org/v1/species/suggest';

  private getTaxonKeySub: Subscription;

  constructor(
    private http: HttpClient
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.scientificName) {
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

    if (this.scientificName) {
      this.loading = true;

      this.getTaxonKeySub = this.http.get(this.speciesApiUrl, {
        headers: new HttpHeaders({'Accept': 'application/json'}),
        responseType: 'text',
        params: {q: this.scientificName}
      })
        .pipe(
          map(data => {
            data = JSON.parse(data);

            if (data.length > 0 && data[0]['canonicalName'] === this.scientificName) {
              return data[0]['key'];
            }
          })
        )
        .subscribe(key => {
          if (key) {
            this.layer = L.tileLayer(this.layerUrl + key, {zIndex: 1000});
            this.addLayerToMap();
          }
          this.loading = false;
        });
    } else {
      this.loading = false;
    }
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
