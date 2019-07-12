import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { IdService } from '../../shared/service/id.service';

@Component({
  selector: 'laji-observation-filters',
  templateUrl: './observation-filters.component.html'
})
export class ObservationFiltersComponent {

  @Input() query: WarehouseQueryInterface;
  @Input() visible: boolean;
  @Output() queryChange = new EventEmitter<WarehouseQueryInterface>();

  constructor() { }

  onRecordBasis(event) {
    if (event.row && event.row.unit && event.row.unit.superRecordBasis) {
      this.collectionFilterSelect('superRecordBasis', event.row.unit.superRecordBasis);
    }
  }

  onCollectionSelect(event) {
    if (event.row && event.row.document && event.row.document.collectionId) {
      this.collectionFilterSelect('collectionId', IdService.getId(event.row.document.collectionId));
    }
  }

  onMediaSelect() {
    this.queryChange.emit({...this.query, hasUnitMedia: (this.query.hasUnitMedia ? undefined : true)});
  }

  private collectionFilterSelect(key: keyof WarehouseQueryInterface, value: string) {
    const all = this.query[key] || [];
    if (!Array.isArray(all)) {
      return;
    }
    const idx = all.indexOf(value);
    if (idx > -1) {
      this.queryChange.emit({...this.query, [key]: [...all.slice(0, idx), ...all.slice(idx + 1)]});
    } else {
      this.queryChange.emit({...this.query, [key]: [...all, value]});
    }
  }

}
