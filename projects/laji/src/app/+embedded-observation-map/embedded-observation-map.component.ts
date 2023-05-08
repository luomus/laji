import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { WarehouseQueryInterface } from '../shared/model/WarehouseQueryInterface';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { SearchQueryService } from '../+observation/search-query.service';
import { Observable } from 'rxjs';
import { LajiMapTileLayersOptions } from '@laji-map/laji-map.interface';
import { ObservationVisualizationMode } from '../shared-modules/observation-map/observation-map/observation-visualization';

interface EmbeddedObservationMapOptions {
  query: WarehouseQueryInterface;
  visualizationMode: ObservationVisualizationMode;
  center: [number, number];
  zoom: number;
  tileLayers: LajiMapTileLayersOptions;
}

@Component({
  template: `
    <ng-container *ngIf="options$ | async as options">
      <laji-observation-map
        [height]="-1"
        [query]="options.query"
        [initWithWorldMap]="true"
        [controls]="{layer: false}"
        [visualizationMode]="options.visualizationMode"
        [settingsKey]="'embeddedObservationMap'"
        [noClick]="true"
        [center]="options.center"
        [zoom]="options.zoom"
        [tileLayers]="options.tileLayers"
        [availableOverlayNameBlacklist]="[]"
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

  private getMapOptionsFromUrlQueryParams(params): Pick<EmbeddedObservationMapOptions, 'visualizationMode'|'center'|'zoom'|'tileLayers'> {
    const { visualizationMode = 'obsCount', center = '', zoom = '', world = 'true', layers = 'openStreetMap', overlayNames = '' } = params;

    const parsedCenter = center.split(',').map(value => parseFloat(value)).filter(value => !!value);
    const _center: [number, number] = parsedCenter.length === 2 ? parsedCenter : [64.8, 25];

    const _zoom = parseFloat(zoom) || 1.6;

    let tileLayers;
    if (world || layers || overlayNames) {
      const active = world === 'true' ? 'world' : 'finnish';
      const _layers = (`${layers},${overlayNames}`.split(',') as string[])
        .filter(s => s)
        .reduce<LajiMapTileLayersOptions['layers']>(
          (lrs, layerName) => ({ ...lrs, [layerName]: true }),
          {} as LajiMapTileLayersOptions['layers']
        );
      tileLayers = { active, layers: _layers };
    }

    return { visualizationMode, center: _center, zoom: _zoom, tileLayers };
  }
}

