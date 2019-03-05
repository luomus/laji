import { Component, Input, OnInit } from '@angular/core';
import { TaxonomyDescription } from '../../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-description-source',
  templateUrl: './taxon-description-source.component.html',
  styleUrls: ['./taxon-description-source.component.scss']
})
export class TaxonDescriptionSourceComponent implements OnInit {
  @Input() taxonDescription: TaxonomyDescription;

  constructor() { }

  ngOnInit() {
  }

}
