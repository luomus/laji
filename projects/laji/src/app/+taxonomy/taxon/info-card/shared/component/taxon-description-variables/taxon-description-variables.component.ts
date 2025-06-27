import { Component, Input } from '@angular/core';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type TaxonDescriptionVariable = components['schemas']['Taxon']['descriptions'][number]['groups'][number]['variables'][number];

@Component({
  selector: 'laji-taxon-description-variables',
  templateUrl: './taxon-description-variables.component.html',
  styleUrls: ['./taxon-description-variables.component.scss']
})
export class TaxonDescriptionVariablesComponent {

  @Input() variables!: TaxonDescriptionVariable[];

}
