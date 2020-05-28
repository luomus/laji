import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { SelectStyle } from '../search-filters/metadata-select/metadata-select.component';

type FORMAT = 'csv'|'tsv'|'ods'|'xlsx';

@Component({
  selector: 'laji-download',
  template: `
    <lu-button [disabled]="disabled" (click)="openModal(modal)" [role]="role">
      <ng-content></ng-content>
    </lu-button>
    <ng-template #modal>
      <div class="modal-header">
        <button class="close pull-right" type="button" (click)="modalRef.hide()">
          <i class="glyphicon glyphicon-remove"></i>
        </button>
        <h4>{{ 'haseka.submissions.chooseFormat' | translate }}</h4>
      </div>
      <div class="modal-body">
        <div>
          <ng-container *ngIf="showReason">
            <label for="reason">{{ 'download.reason' | translate }}</label>
            <laji-metadata-select
              [selectStyle]="basicSelectStyle"
              [placeholder]="'download.reason-list' | translate"
              [alt]="'HBF.dataUsePurposeEnum'"
              [labelAsValue]="true"
              [ngModel]="reasonEnum"
              (ngModelChange)="reasonEnumChange.emit($event)"
            ></laji-metadata-select>
            <textarea
              style="margin-top: 5px"
              class="form-control"
              name="reason"
              [placeholder]="'information.more' | translate"
              [ngModel]="reason"
              (ngModelChange)="reasonChange.emit($event)"
            ></textarea>
          </ng-container>
          <div class="radio" *ngIf="_formats.indexOf('csv') > -1">
            <label>
              <input type="radio" name="optradio" [(ngModel)]="fileType" value="csv">
              {{ 'species.download.textFile' | translate }} (.csv)
            </label>
          </div>
          <div class="radio" *ngIf="_formats.indexOf('tsv') > -1">
            <label>
              <input type="radio" name="optradio" [(ngModel)]="fileType" value="tsv">
              {{ 'species.download.textFile' | translate }} (.tsv)
            </label>
          </div>
          <div class="radio" *ngIf="_formats.indexOf('ods') > -1">
            <label><input type="radio" name="optradio" [(ngModel)]="fileType" value="ods">OpenDocument Spreadsheet (.ods)</label>
          </div>
          <div class="radio" *ngIf="_formats.indexOf('xlsx') > -1">
            <label><input type="radio" name="optradio" [(ngModel)]="fileType" value="xlsx">Excel (.xlsx)</label>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <div class="row">
          <div class="col-sm-12">
            <laji-spinner [spinning]="downloadLoading" [overlay]="true">
              <button type="button"
                      class="btn btn-default pull-right"
                      [disabled]="downloadLoading || (showReason && !reason && !reasonEnum)"
                      (click)="onDownload()">
                <span>{{ "haseka.submissions.download" | translate }}</span>
              </button>
            </laji-spinner>
          </div>
        </div>
      </div>
    </ng-template><!-- /.modal -->
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DownloadComponent {

  @Input() disabled = false;
  @Input() downloadLoading = false;
  @Input() showBackdrop = true;
  @Input() showReason = false;
  @Input() role = 'secondary';
  @Input() reason = '';
  @Input() reasonEnum = '';

  _formats: FORMAT[] = ['tsv', 'ods', 'xlsx'];

  fileType = 'tsv';
  modalRef: BsModalRef;
  basicSelectStyle = SelectStyle.basic;

  @Output() reasonChange = new EventEmitter<string>();
  @Output() reasonEnumChange = new EventEmitter<string>();
  @Output() download = new EventEmitter<string>();

  @Input() set formats(formats: FORMAT[]) {
    if (formats.length > 0) {
      this._formats = formats;
      this.fileType = formats[0];
    }
  }

  constructor(
    private modalService: BsModalService
  ) { }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {backdrop: this.showBackdrop, class: 'modal-sm'});
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  onDownload() {
    if (this.showReason && !this.reason && !this.reasonEnum) {
      return;
    }
    this.download.emit(this.fileType);
  }

}
