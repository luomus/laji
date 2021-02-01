import { ChangeDetectionStrategy, Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { SelectOptions } from '../select/select.component';
import { MetadataSelectComponent } from '../metadata-select/metadata-select.component';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';


@Component({
  selector: 'laji-metadata-select-with-subcategories',
  templateUrl: './metadata-select-with-subcategories.component.html',
  styleUrls: ['./metadata-select-with-subcategories.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetadataSelectWithSubcategoriesComponent extends MetadataSelectComponent implements OnChanges {
  @Input() query: WarehouseQueryInterface;
  @Input() subCategories = [];
  @Input() subTitleBase = '';
  @Input() filtersName = [];
  @Input() filtersValues = [];

  @Output() update = new EventEmitter<{id: string[] | string, category: string}>();

  categoryOptions:  {[key: string]: SelectOptions[]} = {};
  queryToSelect = [];

  ngOnChanges(changes) {
    super.ngOnChanges(changes);
    this.queryToSelect = this.filtersValues;
  }

  protected setOptions(options: SelectOptions[]) {
    super.setOptions(options);
    this.subCategories.forEach(item => {
      this.categoryOptions[item] = options;
      console.log(options)
    });
  }

  refreshValue(value: any): void {
    if (!value) {
      return;
    }
    this.update.emit(value);
  }

}
