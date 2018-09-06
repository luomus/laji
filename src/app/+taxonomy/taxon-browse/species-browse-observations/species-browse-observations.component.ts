import { Component, Input } from '@angular/core';
import { Router } from '@angular/router'
import { TaxonomySearchQuery } from '../service/taxonomy-search-query';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { LocalizeRouterService } from '../../../locale/localize-router.service';

@Component({
  selector: 'laji-species-browse-observations',
  templateUrl: './species-browse-observations.component.html',
  styleUrls: ['./species-browse-observations.component.css']
})
export class SpeciesBrowseObservationsComponent {
  @Input() searchQuery: TaxonomySearchQuery;

  constructor(
    private router: Router,
    private localizeRouterService: LocalizeRouterService
  ) { }

  browse() {
    const query = this.searchQuery.query;

    const parameters: WarehouseQueryInterface = {
      informalTaxonGroupId: query.informalGroupFilters ? [query.informalGroupFilters] : undefined,
      target: query.target ? [query.target] : undefined,
      finnish: query.onlyFinnish,
      redListStatusId: query.redListStatusFilters,
      administrativeStatusId: query.adminStatusFilters,
      typeOfOccurrenceId: query.typesOfOccurrenceFilters,
      typeOfOccurrenceIdNot: query.typesOfOccurrenceNotFilters,
      invasive: query.invasiveSpeciesFilter
    };

    this.router.navigate(
      this.localizeRouterService.translateRoute(
        ['/observation/map']
      ), {queryParams: parameters}
    )
  }
}
