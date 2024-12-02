import { Component, Input } from '@angular/core';
import { TaxonomyDescriptionVariable } from '../../../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-description-variables',
  templateUrl: './taxon-description-variables.component.html',
  styleUrls: ['./taxon-description-variables.component.scss']
})
export class TaxonDescriptionVariablesComponent {

  @Input() variables!: TaxonomyDescriptionVariable[];

}
