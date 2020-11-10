import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { take } from 'rxjs/operators';
import { ColumnSelector } from '../../../shared/columnselector/ColumnSelector';
import { IColumnGroup } from '../../datatable/service/table-column.service';
import { DatatableColumn } from '../../datatable/model/datatable-column';

@Component({
  selector: 'laji-observation-table-settings',
  template: `
    <ng-template #settingsModal>
      <div class="modal-header">
        <h4 class="modal-title pull-left">
          {{ isAggregate ? ('result.settings.aggregate' | translate) : ('result.settings.list' | translate) }}
        </h4>
      </div>
      <div class="modal-body">
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
                  [fields]="group.fields"
                  [columnsLookup]="columnLookup"
                  [columnSelector]="columnSelector"
                  [required]="columnSelector.required"
                  [selected]="columnSelector.columns"
                ></laji-selected-field-group>
              </ng-container>
            </div>
          </ng-container>
        </div>
        <div class="row">
          <div class="col-sm-6">
            <div *ngIf="showPageSize">
              <laji-page-size-select [pageSize]="pageSize" (pageSizeChange)="pageSizeChange.emit($event)"></laji-page-size-select>
            </div>
          </div>
          <div class="col-sm-6 clear-btn">
            <div class="pull-right">
              <button type="button" tabindex="-1" class="btn btn-default btn-sm" (click)="resetColumns.emit()">
                {{ 'result.reset' | translate }}
              </button>
              <button type="button" tabindex="-1" class="btn btn-primary btn-sm" (click)="closeModal(true)">Ok</button>
            </div>
          </div>
        </div>
      </div>
    </ng-template>
  `
})
export class ObservationTableSettingsComponent {


  @ViewChild('settingsModal', { static: true }) settingsModal: TemplateRef<any>;

  @Input() isAggregate = true;
  @Input() showPageSize = true;
  @Input() pageSize: number;
  @Input() columnSelector: ColumnSelector;
  @Input() numberColumnSelector: ColumnSelector;
  @Input() allAggregateFields: string[];
  @Input() columnGroups: IColumnGroup<DatatableColumn>[][];
  @Input() columnLookup: any = {};

  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() resetColumns = new EventEmitter<void>();
  @Output() close = new EventEmitter<boolean>();

  private modal: BsModalRef;
  private response = false;

  constructor(
    private modalService: BsModalService
  ) { }


  openModal() {
    this.response = false;
    this.modal = this.modalService.show(this.settingsModal, {class: 'modal-lg'});
    this.modalService.onHide.pipe(take(1)).subscribe(() => {
      this.close.emit(this.response);
    });
  }

  closeModal(ok = false) {
    if (this.modal) {
      this.response = ok;
      this.modal.hide();
    }
  }

}
