import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, TemplateRef } from '@angular/core';
// import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SelectStyle } from '../select/metadata-select/metadata-select.component';
import { FileCrs, FileGeometry } from '../../shared/service/geo-convert.service';
import { KeyValue } from '@angular/common';

export type FORMAT = 'csv'|'tsv'|'ods'|'xlsx'|'shp'|'gpkg';

export interface DownloadParams {
  fileType: FORMAT;
  geometry?: FileGeometry;
  crs?: FileCrs;
}

@Component({
  selector: 'laji-download',
  template: ` <button [class]="'btn btn-' + role" [disabled]="disabled" (click)="openModal()">
      <ng-content></ng-content>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DownloadComponent implements OnChanges {

  @Input() disabled = false;
  @Input() downloadLoading = false;
  @Input() progressPercent?: number;
  @Input() showFileTypes = true;
  @Input() showBackdrop = true;
  @Input() showReason = false;
  @Input() closeModalOnDownloadStart = false;
  @Input() role = 'default';
  @Input() reason = '';
  @Input() reasonEnum = '';

  _formats: FORMAT[] = ['tsv', 'ods', 'xlsx'];

  fileType: FORMAT = 'tsv';
  geometry: FileGeometry = FileGeometry.point;
  crs: FileCrs = FileCrs.euref;
  // modalRef: BsModalRef;
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
    // private modalService: BsModalService
  ) { }

  ngOnChanges() {
    this.checkCanDownloadStatus();
  }

  openModal() {
    // this.modalRef = this.modalService.show(template, {backdrop: this.showBackdrop, class: 'modal-sm'});
  }

  closeModal() {
    // if (this.modalRef) {
    //   this.modalRef.hide();
    // }
  }

  onDownload() {
    if (this.disableDownLoad) {
      return;
    }
    if (this.closeModalOnDownloadStart) {
      this.closeModal();
    }
    const params: DownloadParams = {fileType: this.fileType};
    if (this.fileType === 'shp' || this.fileType === 'gpkg') {
      params.geometry = this.geometry;
      params.crs = this.crs;
    }
    this.download.emit(params);
  }

  sortNull = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => 0;

  checkCanDownloadStatus() {
    this.disableDownLoad = this.downloadLoading ||
      (this.showReason && (!this.reason || !this.reasonEnum));
  }

}
