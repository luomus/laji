import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { filter, take } from 'rxjs/operators';
import { ColumnSelector } from '../../../shared/columnselector/ColumnSelector';
import { IColumnGroup, IGenericColumn } from '../../datatable/service/table-column.service';
import { DatatableColumn } from '../../datatable/model/datatable-column';
import {ModalRef, ModalService} from 'projects/laji-ui/src/lib/modal/modal.service';

@Component({
  selector: 'laji-observation-table-settings',
  template: `
    <ng-template #settingsModal>
      <h4>{{ isAggregate ? ('result.settings.aggregate' | translate) : ('result.settings.list' | translate) }}</h4>
      <div class="row" *ngIf="isAggregate && !!columnSelector && !!numberColumnSelector">
        <div class="col-sm-6 col-md-4">
          <laji-selected-field-group
            header="result.aggregate.fields"
            [fields]="allAggregateFields"
            [columnsLookup]="columnLookup"
            [columnSelector]="columnSelector"
            [selected]="columnSelector.columns"
          ></laji-selected-field-group>
        </div>
        <div class="col-sm-6 col-md-4">
          <laji-selected-field-group
            header="result.aggregate.numbers"
            [fields]="[
              'individualCountSum',
              'individualCountMax',
              'oldestRecord',
              'newestRecord'
              ]"
            [columnsLookup]="columnLookup"
            [columnSelector]="numberColumnSelector"
            [selected]="numberColumnSelector.columns"
          ></laji-selected-field-group>
        </div>
      </div>

      <div class="row" *ngIf="!isAggregate && !!columnGroups">
        <ng-container *ngFor="let col of columnGroups ">
          <div class="col-sm-6 col-md-4">
            <ng-container *ngFor="let group of col">
              <laji-selected-field-group
                [header]="group.header"
                [fields]="$any(group.fields)"
                [columnsLookup]="columnLookup"
                [columnSelector]="columnSelector"
                [required]="columnSelector.required"
                [selected]="columnSelector.columns"
              ></laji-selected-field-group>
            </ng-container>
          </div>
        </ng-container>
      </div>
      <div class="d-flex justify-between gap-4">
        <div>
          <div *ngIf="showPageSize">
            <laji-page-size-select [pageSize]="pageSize" (pageSizeChange)="pageSizeChange.emit($event)"></laji-page-size-select>
          </div>
        </div>
        <div class="modal-footer-top-offset">
          <button type="button" class="btn btn-default mr-3" (click)="resetColumns.emit()">{{ 'result.reset' | translate }}</button>
          <button type="button" class="btn btn-primary" (click)="closeModal(true)">Ok</button>
        </div>
      </div>
    </ng-template>
  `,
  styleUrls: ['./observation-table-settings.component.scss']
})
export class ObservationTableSettingsComponent<T extends IGenericColumn<DatatableColumn> = IGenericColumn<DatatableColumn>> {

  @ViewChild('settingsModal', { static: true }) settingsModal: TemplateRef<any>;

  @Input() isAggregate = true;
  @Input() showPageSize = true;
  @Input() pageSize: number;
  @Input() columnSelector: ColumnSelector;
  @Input() numberColumnSelector: ColumnSelector;
  @Input() allAggregateFields: string[];
  @Input() columnGroups: IColumnGroup<T>[][];
  @Input() columnLookup: any = {};

  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() resetColumns = new EventEmitter<void>();
  @Output() settingsClose = new EventEmitter<boolean>();

  private modal: ModalRef<any>;
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
