import { Component, OnInit, Input } from '@angular/core';
import { Taxonomy } from '../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-names',
  templateUrl: './taxon-names.component.html',
  styleUrls: ['./taxon-names.component.scss']
})
export class TaxonNamesComponent implements OnInit {
  private vernacularNameLangs = [];

  @Input() set taxon(taxon: Taxonomy) {

  }

  constructor() { }

  ngOnInit() {
  }

}
