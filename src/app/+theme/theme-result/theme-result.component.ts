import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { IdService } from '../../shared/service/id.service';


@Component({
  selector: 'laji-theme-result',
  templateUrl: './theme-result.component.html',
  styleUrls: ['./theme-result.component.css']
})
export class ThemeResultComponent {

  @Input() query: WarehouseQueryInterface;
  @Input() height;
  @Input() lang;
  @Input() fields = ['unit.linkings.taxon', 'unit.linkings.taxon.scientificName', 'individualCountSum'];
  @Output() onNameClick = new EventEmitter<WarehouseQueryInterface>();

  constructor() { }

  onRowSelect(event) {
    if (event.row
      && event.row.unit
      && event.row.unit.linkings
      && event.row.unit.linkings.taxon
      && event.row.unit.linkings.taxon.id) {
      this.onNameClick.emit({...this.query, taxonId: IdService.getId(event.row.unit.linkings.taxon.id)});
    }
  }

}
