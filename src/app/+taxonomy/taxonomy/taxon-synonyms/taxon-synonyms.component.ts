import { Component, OnInit, Input } from '@angular/core';
import { Taxonomy } from '../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-synonyms',
  templateUrl: './taxon-synonyms.component.html',
  styleUrls: ['./taxon-synonyms.component.scss']
})
export class TaxonSynonymsComponent implements OnInit {
  @Input() taxon: Taxonomy;

  constructor() { }

  ngOnInit() {
  }

}
