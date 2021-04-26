import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IKerttuSpeciesQuery } from '../../../kerttu-global-shared/models';

@Component({
  selector: 'laji-species-list-filters',
  templateUrl: './species-list-filters.component.html',
  styleUrls: ['./species-list-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesListFiltersComponent implements OnInit {
  query: IKerttuSpeciesQuery = {
    onlyUnvalidated: false
  };

  constructor() { }

  ngOnInit(): void {
  }

}
