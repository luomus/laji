import { Component, Input } from '@angular/core';
import { Router } from '@angular/router'
import { TaxonomySearchQuery } from '../service/taxonomy-search-query';

@Component({
  selector: 'laji-species-browse-observations',
  templateUrl: './species-browse-observations.component.html',
  styleUrls: ['./species-browse-observations.component.css']
})
export class SpeciesBrowseObservationsComponent {
  @Input() searchQuery: TaxonomySearchQuery;

  constructor(
    private router: Router
  ) { }

  browse() {
    const query = this.searchQuery.query;

    const parameters = {
      informalTaxonGroupId: query.informalGroupFilters ? [query.informalGroupFilters] : undefined,
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
