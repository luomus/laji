import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { WarehouseQueryInterface } from '../shared/model/WarehouseQueryInterface';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { SearchQueryService } from '../+observation/search-query.service';
import { Observable } from 'rxjs';

interface EmbeddedObservationMapOptions {
  query: WarehouseQueryInterface;
  center: [number, number];
  zoom: number;
}

@Component({
  template: `
    <ng-container *ngIf="options$ | async as options">
      <laji-observation-map
        [height]="-1"
        [query]="options.query"
        [initWithWorldMap]="true"
        [controls]="{layer: false}"
        [visualizationMode]="'recordAge'"
        [settingsKey]="'embeddedObservationMap'"
        [noClick]="true"
        [center]="options.center"
        [zoom]="options.zoom"
      ></laji-observation-map>
    </ng-container>
  `,
  selector: 'laji-embedded-observation-map',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmbeddedObservationMapComponent implements OnInit {
  options$: Observable<EmbeddedObservationMapOptions>;

  constructor(
    private route: ActivatedRoute,
    private searchQueryService: SearchQueryService
  ) {}

  ngOnInit() {
    this.options$ = this.route.queryParams.pipe(
      map(params => ({
        query: this.searchQueryService.getQueryFromUrlQueryParams(params),
        ...this.getMapOptionsFromUrlQueryParams(params)
      }))
    );
  }

  private getMapOptionsFromUrlQueryParams(params): Pick<EmbeddedObservationMapOptions, 'center'|'zoom'> {
    let center: [number, number] = [64.8, 25];
    if (params['center']) {
      const parsedCenter = params['center'].split(',').map(value => parseFloat(value)).filter(value => !!value);
      if (parsedCenter.length === 2) {
        center = parsedCenter;
      }
    }

    let zoom = 1.6;
    if (params['zoom']) {
      const parsedZoom = parseFloat(params['zoom']);
      if (parsedZoom) {
        zoom = parsedZoom;
      }
    }

    return { center, zoom };
  }
}

