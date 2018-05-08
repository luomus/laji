import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { TaxonExportService } from './taxon-export.service';

@Component({
  selector: 'laji-species-download',
  templateUrl: './species-download.component.html',
  styleUrls: ['./species-download.component.css'],
  providers: [TaxonExportService],
})
export class SpeciesDownloadComponent implements OnInit {
  @Input() data: any;
  @Input() columns: any;

  fileType = 'tsv';

  @ViewChild('chooseFileTypeModal') public modal: ModalDirective;

  constructor(
    private taxonExportService: TaxonExportService
  ) { }

  ngOnInit() { }

  download() {
    this.taxonExportService.downloadTaxons(this.columns, this.data, this.fileType);
  }
}
