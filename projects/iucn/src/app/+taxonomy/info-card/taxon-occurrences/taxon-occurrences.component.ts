import { Component, Input } from '@angular/core';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Occurrence = components['schemas']['Occurrence'];

@Component({
  selector: 'iucn-taxon-occurrences',
  templateUrl: './taxon-occurrences.component.html',
  styleUrls: ['./taxon-occurrences.component.scss']
})
export class TaxonOccurrencesComponent {
  @Input() occurrences?: Occurrence[];

}
