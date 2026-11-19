import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { IdService } from '../../shared/service/id.service';
import { DataFetchMode } from '../observation-data.service';

@Component({
    selector: 'laji-observation-filters',
    templateUrl: './observation-filters.component.html',
    standalone: false
})
export class ObservationFiltersComponent {
  @Input() dataMode: DataFetchMode = 'unit';
  @Input({ required: true }) query!: WarehouseQueryInterface;
  @Input({ required: true }) visible!: boolean;
  @Input() onlyCount = true;
  @Output() queryChange = new EventEmitter<WarehouseQueryInterface>();
}
