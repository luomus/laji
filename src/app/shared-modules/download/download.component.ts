import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';

type FORMAT = 'csv'|'tsv'|'ods'|'xlsx';

@Component({
  selector: 'laji-download',
  template: `
    <lu-button [disabled]="disabled" (click)="openModal(modal)" [role]="role"><ng-content></ng-content></lu-button>
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
            <textarea class="form-control" name="reason" [ngModel]="reason" (ngModelChange)="reasonChange.emit($event)"></textarea>
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
              <button type="button" class="btn btn-default pull-right" [disabled]="downloadLoading || (showReason && !reason)" (click)="onDownload()">
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

  _formats: FORMAT[] = ['tsv', 'ods', 'xlsx'];

  fileType = 'tsv';
  modalRef: BsModalRef;

  @Output() reasonChange = new EventEmitter<string>();
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
    if (this.showReason && !this.reason) {
      return;
    }
    this.download.emit(this.fileType);
  }

}
