import { Component, Input, OnInit, OnChanges, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { TaxonConceptService } from './taxon-concept.service';
import { TaxonMatch } from './taxon-match.model';
import { Taxonomy } from '../../../shared/model/Taxonomy';
import { Subscription } from 'rxjs';

@Component({
  selector: 'laji-taxon-concept-info',
  templateUrl: './taxon-concept-info.component.html',
  styleUrls: ['./taxon-concept-info.component.css'],
  providers: [TaxonConceptService]
})
export class TaxonConceptInfoComponent implements OnInit, OnChanges {

  @Input() taxon: Taxonomy;
  matches: TaxonMatch[];

  private subs: Subscription[] = [];

  constructor(
    private taxonConceptService: TaxonConceptService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.fetchList();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['taxon'] && !changes['taxon'].firstChange) {
      this.fetchList();
    }
  }

  fetchList() {
    for (let i = 0; i < this.subs.length; i++) {
      if (this.subs[i]) {
        this.subs[i].unsubscribe();
      }
    }
    this.matches = [];
    this.subs = [];

    this.subs.push(this.taxonConceptService.getMatches(this.taxon.id, this.taxon['skosExactMatch']).subscribe(matches => {
      if (matches.length === 0) {
        this.cd.markForCheck();
      }

      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];

        this.subs.push(this.taxonConceptService.getMatchInfo(match).subscribe(info => {
          this.matches.push(info);
          this.cd.markForCheck();
        }));
      }
    }));
  }

}
