import { Component, Input } from '@angular/core';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type LatestRedListStatusFinland = components['schemas']['Taxon']['latestRedListStatusFinland'];

@Component({
  selector: 'laji-taxon-status-history',
  templateUrl: './taxon-status-history.component.html',
  styleUrls: ['./taxon-status-history.component.css']
})
export class TaxonStatusHistoryComponent {

  @Input()
  history: LatestRedListStatusFinland[] = [];

}
