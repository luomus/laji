import { Component, Input } from '@angular/core';
import { Taxonomy } from '../../../shared';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-taxon-info',
  templateUrl: './taxon-info.component.html',
  styleUrls: ['./taxon-info.component.css']
})
export class TaxonInfoComponent {

  @Input() taxon: Taxonomy;

  constructor(public translate: TranslateService) {}

}
