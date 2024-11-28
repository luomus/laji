import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { WarehouseQueryInterface } from '../../../../shared/model/WarehouseQueryInterface';
import { IdService } from '../../../../shared/service/id.service';


@Component({
  selector: 'laji-theme-result',
  templateUrl: './theme-result.component.html',
  styleUrls: ['./theme-result.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeResultComponent {

  @Input() showSettings = false;
  @Input() query!: WarehouseQueryInterface;
  @Input() height!: string;
  @Input() fields = ['unit.linkings.species.vernacularName', 'unit.linkings.species.scientificName', 'individualCountSum'];
  @Input() useStatistics?: boolean;
  @Output() nameClick = new EventEmitter<WarehouseQueryInterface>();
  @Output() selectChange = new EventEmitter();

  constructor(public translate: TranslateService) { }

  onRowSelect(event: any) {
    const id = event.row
      && event.row.unit
      && event.row.unit.linkings
      && event.row.unit.linkings.taxon
      && (event.row.unit.linkings.taxon.id || event.row.unit.linkings.taxon.speciesId);
    if (id) {
      this.nameClick.emit({...this.query, taxonId: IdService.getId(id)});
    }
  }

}
