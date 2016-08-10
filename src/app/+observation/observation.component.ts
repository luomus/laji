import { Component } from '@angular/core';

import { WarehouseQueryInterface, SearchResultComponent } from '../shared';

@Component({
  selector: 'laji-observation',
  templateUrl: './observation.component.html',
  directives: [ SearchResultComponent ]
})
export class ObservationComponent {
  query:WarehouseQueryInterface = {
    finnish: true,
    invasive: true,
    lifeStage: ['ADULT']
  };

}
