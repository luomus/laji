import {Component, Input, SimpleChange} from '@angular/core'

import { Taxonomy } from "../../shared";

@Component({
  selector: 'laji-taxon-info',
  templateUrl: './taxon-info.component.html'
})
export class TaxonInfoComponent {

  @Input() taxon: Taxonomy;

}
