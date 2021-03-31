import { Component, Input } from '@angular/core';
import { Occurrence } from '../../../../../../laji/src/app/shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-occurrences',
  templateUrl: './taxon-occurrences.component.html',
  styleUrls: ['./taxon-occurrences.component.scss']
})
export class TaxonOccurrencesComponent {
  @Input() occurrences: Occurrence[];

}
