import {Component, Input, SimpleChange} from '@angular/core'

import { Taxonomy } from "../../../shared";

@Component({
  selector: 'laji-taxon-info',
  templateUrl: './taxon-info.component.html',
  styleUrls: ['./taxon-info.component.css']
})
export class TaxonInfoComponent {

  @Input() taxon: Taxonomy;

}
