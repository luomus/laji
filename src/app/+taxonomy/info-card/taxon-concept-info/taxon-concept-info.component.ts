import { Component, Input, OnInit } from '@angular/core';
import { TaxonConceptService } from './taxon-concept.service';
import { TaxonInfo } from './taxon-info.model';
import { Taxonomy } from '../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-concept-info',
  templateUrl: './taxon-concept-info.component.html',
  styleUrls: ['./taxon-concept-info.component.css'],
  providers: [TaxonConceptService]
})
export class TaxonConceptInfoComponent implements OnInit {

  @Input() taxon: Taxonomy;
  matches: TaxonInfo[];

  constructor(
    private taxonConceptService: TaxonConceptService
  ) { }

  ngOnInit() {
    this.fetchList();
  }

  fetchList() {
    this.taxonConceptService.getExactMatches(this.taxon.id, this.taxon['skosExactMatch'])
      .subscribe(matches => {
        this.matches = matches;
      });
  }

}
