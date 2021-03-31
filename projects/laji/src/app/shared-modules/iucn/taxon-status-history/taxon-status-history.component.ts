import { Component, Input } from '@angular/core';
import { LatestRedListStatusFinland } from '../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-status-history',
  templateUrl: './taxon-status-history.component.html',
  styleUrls: ['./taxon-status-history.component.css']
})
export class TaxonStatusHistoryComponent {

  @Input()
  history: LatestRedListStatusFinland[] = [];

}
