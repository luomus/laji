import { ChangeDetectionStrategy, Component, Input, OnChanges, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { SelectOption } from '../select/select.component';
import { MetadataSelectComponent } from '../metadata-select/metadata-select.component';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';


@Component({
  selector: 'laji-metadata-select-with-subcategories',
  templateUrl: './metadata-select-with-subcategories.component.html',
  styleUrls: ['./metadata-select-with-subcategories.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetadataSelectWithSubcategoriesComponent extends MetadataSelectComponent implements OnChanges {
  @Input({required: true}) query!: WarehouseQueryInterface;
  @Input() subCategories: string[] = [];
  @Input() subTitleBase = '';
  @Input() filtersName: string[] = [];
  @Input() filtersValues: any[] = [];

  @Output() update = new EventEmitter<{id: string[] | string; category: string}>();

  categoryOptions:  {[key: string]: SelectOption[]} = {};
  queryToSelect: any[] = [];

  ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);
    this.queryToSelect = this.filtersValues;
  }

  refreshValue(value: any): void {
    if (!value) {
      return;
    }
    this.update.emit(value);
  }

}
