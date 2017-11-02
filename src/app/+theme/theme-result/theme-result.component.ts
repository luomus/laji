import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { IdService } from '../../shared/service/id.service';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'laji-theme-result',
  templateUrl: './theme-result.component.html',
  styleUrls: ['./theme-result.component.css']
})
export class ThemeResultComponent {

  @Input() showSettings = false;
  @Input() query: WarehouseQueryInterface;
  @Input() height;
  @Input() fields = ['unit.linkings.species.vernacularName', 'unit.linkings.species.scientificName', 'individualCountSum'];
  @Output() onNameClick = new EventEmitter<WarehouseQueryInterface>();
  @Output() selectChange = new EventEmitter();

  constructor(public translate: TranslateService) { }

  onRowSelect(event) {
    if (event.row
      && event.row.unit
      && event.row.unit.linkings
      && event.row.unit.linkings.taxon
      && event.row.unit.linkings.taxon.id) {
      this.onNameClick.emit({...this.query, taxonId: IdService.getId(event.row.unit.linkings.taxon.id)});
    } else if (event.row
      && event.row.unit
      && event.row.unit.linkings
      && event.row.unit.linkings.taxon
      && event.row.unit.linkings.taxon.speciesId) {
      this.onNameClick.emit({...this.query, taxonId: IdService.getId(event.row.unit.linkings.taxon.speciesId)});
    }
  }

}
