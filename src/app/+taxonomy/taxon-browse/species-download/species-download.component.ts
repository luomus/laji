import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';


@Component({
  selector: 'laji-species-download',
  templateUrl: './species-download.component.html',
  styleUrls: ['./species-download.component.css']
})
export class SpeciesDownloadComponent {
  @Input() downloadLoading = false;

  fileType = 'tsv';

  @Output() onDownload = new EventEmitter<string>();
  @ViewChild('chooseFileTypeModal') public modal: ModalDirective;

  constructor() { }

  download() {
    this.onDownload.emit(this.fileType);
  }
}
