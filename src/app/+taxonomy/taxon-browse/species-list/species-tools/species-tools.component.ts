import { Component, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { TaxonomySearchQuery } from '../../taxonomy-search-query.model';
import { Router } from '@angular/router'

@Component({
  selector: 'laji-species-tools',
  templateUrl: './species-tools.component.html',
  styleUrls: ['./species-tools.component.css'],
})
export class SpeciesToolsComponent {
  @Input() searchQuery: TaxonomySearchQuery;
  @Input() downloadLoading = false;

  fileType = 'tsv';

  @Output() onDownload = new EventEmitter<string>();
  @ViewChild('chooseFileTypeModal') public modal: ModalDirective;

  constructor(
    private router: Router
  ) { }

  download() {
    this.onDownload.emit(this.fileType);
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
