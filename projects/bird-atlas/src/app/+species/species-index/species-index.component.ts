import { ChangeDetectionStrategy, Component } from '@angular/core';
import { map, } from 'rxjs/operators';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'ba-species-index',
  templateUrl: './species-index.component.html',
  styleUrls: ['./species-index.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesIndexComponent {
  speciesList$ = this.api.getTaxa('MX.37580', {
    species: true,
    taxonRanks: 'MX.species',
    langFallback: true,
    typesOfOccurrenceNotFilters: 'MX.typeOfOccurrenceVagrant,MX.typeOfOccurrenceRareVagrant',
    selectedFields: 'id,scientificName,vernacularName',
    onlyFinnish: true,
    sortOrder: 'taxonomic',
    pageSize: 1000
  }).pipe(map(res => res.results));

  constructor(private api: ApiService) {}
}
