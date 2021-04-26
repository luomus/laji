import { Component, ChangeDetectionStrategy, Input, OnChanges, Output, EventEmitter, ViewChild, SimpleChanges } from '@angular/core';
import { Taxonomy } from '../../../../../../laji/src/app/shared/model/Taxonomy';
import { ISelectFields } from '../../../../../../laji/src/app/shared-modules/select-fields/select-fields/select-fields.component';
import { IPageChange } from '../../../../../../laji/src/app/shared-modules/datatable/data-table-footer/data-table-footer.component';
import { Params } from '@angular/router';
import { DownloadComponent } from '../../../../../../laji/src/app/shared-modules/download/download.component';

@Component({
  selector: 'laji-species-table',
  templateUrl: './species-table.component.html',
  styleUrls: ['./species-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesTableComponent implements OnChanges {
  @ViewChild(DownloadComponent) speciesDownload!: DownloadComponent;

  @Input() species: Taxonomy[] = [];

  @Input() defaultFields: ISelectFields[] = [];
  @Input() allFields: ISelectFields[] = [];
  @Input() selected: string[] = [];

  @Input() downloadLoading = false;
  @Input() showTaxonLink = true;
  @Input() taxonLinkQueryParams: Params = {};

  @Input() speciesPageSize = 100;
  @Input() speciesPage = 1;
  @Input() speciesCount = 0;

  @Input() year?: string;

  selectedFields: ISelectFields[] = [];

  @Output() pageChange = new EventEmitter<number>();
  @Output() fieldsChange = new EventEmitter<ISelectFields[]>();
  @Output() download = new EventEmitter<{type: string, fields: ISelectFields[]}>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes.downloadLoading?.previousValue && !this.downloadLoading) {
      this.speciesDownload.closeModal();
    }
    this.setStatusYear();
    this.updateSelectedFields();
  }


  changeSpeciesPage(event: IPageChange) {
    this.pageChange.emit(event.page);
  }

  newFields(field: ISelectFields[]) {
    if (field) {
      this.fieldsChange.emit(field);
    }
  }

  onDownload(type: string) {
    this.download.emit({type, fields: this.selectedFields});
  }

  private setStatusYear() {
    if (this.year) {
      for (const array of [this.defaultFields, this.allFields]) {
        const statusIdx = array.findIndex(item => item.key === 'status');
        if (statusIdx !== -1) {
          array[statusIdx] = {
            ...array[statusIdx],
            label: 'iucn.results.column.class' + this.year
          };
        }
      }
    }
  }

  private updateSelectedFields() {
    this.selectedFields = [];

    if (this.selected) {
      this.selectedFields = this.selected.map(field => {
        const idx = this.allFields.findIndex(item => item.key === field);
        return this.allFields[idx];
      }).filter(item => !!item);
    }

    if (this.selectedFields.length === 0) {
      this.selectedFields = [...this.defaultFields];
    }
  }

}
