import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { filter, take } from 'rxjs/operators';
import { ColumnSelector } from '../../../shared/columnselector/ColumnSelector';
import { IColumnGroup, IGenericColumn } from '../../datatable/service/table-column.service';
import { DatatableColumn } from '../../datatable/model/datatable-column';
import {ModalRef, ModalService} from 'projects/laji-ui/src/lib/modal/modal.service';

@Component({
  selector: 'laji-observation-table-settings',
  templateUrl: './observation-table-settings.component.html',
  styleUrls: ['./observation-table-settings.component.scss']
})
export class ObservationTableSettingsComponent<T extends IGenericColumn<DatatableColumn> = IGenericColumn<DatatableColumn>> {

  @ViewChild('settingsModal', { static: true }) settingsModal!: TemplateRef<any>;

  @Input() isAggregate = true;
  @Input() showPageSize = true;
  @Input() pageSize?: number;
  @Input({ required: true }) columnSelector!: ColumnSelector;
  @Input() numberColumnSelector?: ColumnSelector;
  @Input() allAggregateFields: string[] = [];
  @Input() columnGroups?: IColumnGroup<T>[][];
  @Input() columnLookup: any = {};

  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() resetColumns = new EventEmitter<void>();
  @Output() settingsClose = new EventEmitter<boolean>();

  private modal?: ModalRef<any>;
  private response = false;

  constructor(
    private modalService: ModalService
  ) { }


  openModal() {
    this.response = false;
    this.modal = this.modalService.show<any>(this.settingsModal, {size: 'lg'});
    this.modal.onShownChange.pipe(filter(shown => shown === false) ,take(1)).subscribe(() => {
      this.settingsClose.emit(this.response);
    });
  }

  closeModal(ok = false) {
    if (this.modal) {
      this.response = ok;
      this.modal.hide();
    }
  }

}
