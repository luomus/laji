import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'ba-species-index',
  templateUrl: './species-index.component.html',
  styleUrls: ['./species-index.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesIndexComponent {
  speciesList$: Observable<any> = this.api.getTaxa('MX.37580', {
    langFallback: true,
    typesOfOccurrenceNotFilters: 'MX.typeOfOccurrenceVagrant,MX.typeOfOccurrenceRareVagrant',
    selectedFields: 'id,scientificName,vernacularName',
    onlyFinnish: true,
    sortOrder: 'taxonomic',
    pageSize: 1000
  }).pipe(map(res => res.results));

  constructor(private api: ApiService) {}
}
