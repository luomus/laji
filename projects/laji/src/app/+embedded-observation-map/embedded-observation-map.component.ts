import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WarehouseQueryInterface } from '../shared/model/WarehouseQueryInterface';

@Component({
  template: `
    <laji-observation-map
      [height]="-1"
      [query]="query"
      [initWithWorldMap]="true"
      [controls]="{layer: false}"
      [visualizationMode]="'recordAge'"
      [settingsKey]="'embeddedObservationMap'"
      [noClick]="true"
    ></laji-observation-map>
  `,
  selector: 'laji-embedded-observation-map',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmbeddedObservationMapComponent {
  query: WarehouseQueryInterface = {};
}
