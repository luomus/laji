import { Component } from '@angular/core';
import { SearchQuery } from '../search-query.model';

@Component({
  selector: 'laji-observation-header',
  templateUrl: 'observation-header.component.html'
})
export class ObservationHeaderComponent {

  constructor(public searchQuery: SearchQuery) {
  }

}

