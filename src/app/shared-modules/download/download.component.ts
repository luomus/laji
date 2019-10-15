import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';

type FORMAT = 'csv'|'tsv'|'ods'|'xlsx';

@Component({
  selector: 'laji-download',
  template: `
    <a class="{{linkClass}}" (click)="modal.show()"><ng-content></ng-content></a>

    <div class="modal" tabindex="-1" role="dialog" bsModal #chooseFileTypeModal="bs-modal">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <button class="close pull-right" type="button" (click)="modal.hide()">
              <i class="glyphicon glyphicon-remove"></i>
            </button>
            <h4>{{ 'haseka.submissions.chooseFormat' | translate }}</h4>
          </div>
          <div class="modal-body">
            <div>
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
              <div class="col-xs-push-10 col-xs-2 col-sm-push-8 col-sm-4">
                <laji-spinner [spinning]="downloadLoading" [overlay]="true">
                  <button type="button" class="btn btn-default" [disabled]="downloadLoading" (click)="onDownload()">
                    <span>{{ "haseka.submissions.download" | translate }}</span>
                  </button>
                </laji-spinner>
              </div>
            </div>
          </div>
        </div><!-- /.modal-content -->
      </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DownloadComponent {

  @Input() downloadLoading = false;
  @Input() linkClass = 'link';

  _formats: FORMAT[] = ['tsv', 'ods', 'xlsx'];

  fileType = 'tsv';

  @Output() download = new EventEmitter<string>();
  @ViewChild('chooseFileTypeModal', { static: true }) public modal: ModalDirective;

  @Input() set formats(formats: FORMAT[]) {
    if (formats.length > 0) {
      this._formats = formats;
      this.fileType = formats[0];
    }
  }

  constructor() { }

  onDownload() {
    this.download.emit(this.fileType);
  }

}
