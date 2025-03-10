import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, TemplateRef } from '@angular/core';
import { SelectStyle } from '../select/metadata-select/metadata-select.component';
import { FileCrs, FileGeometry } from '../../shared/service/geo-convert.service';
import { KeyValue } from '@angular/common';
import { ModalRef, ModalService } from 'projects/laji-ui/src/lib/modal/modal.service';

export type FORMAT = 'csv'|'tsv'|'ods'|'xlsx'|'gpkg';

export interface DownloadParams {
  fileType: FORMAT;
  geometry?: FileGeometry;
  crs?: FileCrs;
}

@Component({
  selector: 'laji-download',
  template: `
    <button [class]="'btn btn-' + role" [disabled]="disabled" (click)="openModal(modal)">
      <ng-content></ng-content>
    </button>
    <ng-template #modal>
      <h4>{{ 'haseka.submissions.chooseFormat' | translate }}</h4>
      <div>
        <laji-download-modal-reason *ngIf="showReason"
          [reason]="reason" [reasonEnum]="reasonEnum"
          (reasonChange)="reasonChange.emit($event)" (reasonEnumChange)="reasonEnumChange.emit($event)">
        </laji-download-modal-reason>
        <ng-container *ngIf="showFileTypes">
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
          <div class="radio" *ngIf="_formats.indexOf('gpkg') > -1">
            <label><input type="radio" name="optradio" [(ngModel)]="fileType" value="gpkg">GeoPackage (.gpkg)</label>
          </div>
          <ng-container *ngIf="fileType === 'gpkg'">
            <div class="mb-3">
              <label for="geometry">{{ 'download.geometry' | translate }}:</label>
              <select id="geometry" name="geometry" class="form-control" [(ngModel)]="geometry">
                <option *ngFor="let option of fileGeometryEnum | keyvalue: sortNull" [ngValue]="option.value">{{ option.value }}</option>
              </select>
            </div>
            <div>
              <label for="crs">{{ 'download.crs' | translate }}:</label>
              <select id="crs" name="crs" class="form-control" [(ngModel)]="crs">
                <option *ngFor="let option of fileCrsEnum | keyvalue: sortNull" [ngValue]="option.value">{{ option.value }}</option>
              </select>
            </div>
          </ng-container>
        </ng-container>
      </div>
      <div class="lu-modal-footer">
        <div class="row">
          <div class="col-sm-12">
            <laji-spinner [spinning]="downloadLoading" [overlay]="true">
              <button type="button"
                      [luTooltip]="showReason && disableDownLoad ? ('download.reason-required' | translate) : ''"
                      class="btn btn-default pull-right"
                      [disabled]="disableDownLoad"
                      (click)="onDownload()">
                <span>
                  {{ (downloadLoading ? 'haseka.submissions.downloading' : 'haseka.submissions.download') | translate }}
                  <ng-container *ngIf="downloadLoading && progressPercent !== undefined">
                    {{ progressPercent }} %
                  </ng-container>
                </span>
              </button>
            </laji-spinner>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DownloadComponent implements OnChanges {

  @Input() disabled = false;
  @Input() downloadLoading = false;
  @Input() progressPercent?: number;
  @Input() showFileTypes = true;
  @Input() showReason = false;
  @Input() role = 'default';
  @Input() reason = '';
  @Input() reasonEnum = '';

  _formats: FORMAT[] = ['tsv', 'ods', 'xlsx'];

  fileType: FORMAT = 'tsv';
  geometry: FileGeometry = FileGeometry.point;
  crs: FileCrs = FileCrs.euref;
  modalRef?: ModalRef;
  basicSelectStyle = SelectStyle.basic;
  disableDownLoad = false;

  fileGeometryEnum = FileGeometry;
  fileCrsEnum = FileCrs;

  @Output() reasonChange = new EventEmitter<string>();
  @Output() reasonEnumChange = new EventEmitter<string>();
  @Output() download = new EventEmitter<DownloadParams>();

  @Input() set formats(formats: FORMAT[]) {
    if (formats.length > 0) {
      this._formats = formats;
      this.fileType = formats[0];
    }
  }

  constructor(
    private modalService: ModalService
  ) { }

  ngOnChanges() {
    this.checkCanDownloadStatus();
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {size: 'sm'});
  }

  closeModal() {
    this.modalRef?.hide();
  }

  onDownload() {
    if (this.disableDownLoad) {
      return;
    }
    const params: DownloadParams = {fileType: this.fileType};
    if (this.fileType === 'gpkg') {
      params.geometry = this.geometry;
      params.crs = this.crs;
    }
    this.closeModal();
    this.download.emit(params);
  }

  sortNull = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => 0;

  checkCanDownloadStatus() {
    this.disableDownLoad = this.downloadLoading ||
      (this.showReason && (!this.reason || !this.reasonEnum));
  }
}
