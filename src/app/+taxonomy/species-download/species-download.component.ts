import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { ObservationTableColumn } from '../../shared-modules/observation-result/model/observation-table-column';
import { TaxonExportService } from './taxon-export.service';
import { TaxonomySearchQuery } from '../taxonomy-search-query.model';
import { Router } from '@angular/router'

@Component({
  selector: 'laji-species-download',
  templateUrl: './species-download.component.html',
  styleUrls: ['./species-download.component.css'],
  providers: [TaxonExportService],
})
export class SpeciesDownloadComponent implements OnInit {
  @Input() data: any;
  @Input() columns: ObservationTableColumn[] = [];
  @Input() searchQuery: TaxonomySearchQuery;

  fileType = 'tsv';

  @ViewChild('chooseFileTypeModal') public modal: ModalDirective;

  constructor(
    private taxonExportService: TaxonExportService,
    private router: Router
  ) { }

  ngOnInit() { }

  download() {
    this.taxonExportService.downloadTaxons(this.columns, this.data, this.fileType);
  }

  browse() {
    const query = this.searchQuery.query;

    const parameters = {
      informalTaxonGroupId: query.informalTaxonGroupId ? [query.informalTaxonGroupId] : undefined,
      target: query.target,
      finnish: query.onlyFinnish,
      invasive: query.invasiveSpeciesFilter,
      redListStatusId: query.redListStatusFilters,
      administrativeStatusId: query.adminStatusFilters
    };

    this.router.navigate(
      ['/observation/map'],
      {queryParams: parameters}
    );
  }
}
