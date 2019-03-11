import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { TaxonConceptService } from './taxon-concept.service';
import { TaxonMatch } from './taxon-match.model';
import { Subscription } from 'rxjs';
import {Taxonomy} from '../../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-concept-info',
  templateUrl: './taxon-concept-info.component.html',
  styleUrls: ['./taxon-concept-info.component.css'],
  providers: [TaxonConceptService]
})
export class TaxonConceptInfoComponent implements OnChanges, OnDestroy {
  @Input() taxon: Taxonomy;

  taxonConceptId: string;
  matches: TaxonMatch[];

  private subs: Subscription[] = [];

  constructor(
    private taxonConceptService: TaxonConceptService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnChanges() {
    this.taxonConceptId = undefined;
    if (this.taxon.taxonConceptIds && this.taxon.taxonConceptIds[0]) {
      this.taxonConceptId = this.taxon.taxonConceptIds[0].replace('taxonid:', '');
    }
    this.fetchList();
  }

  ngOnDestroy() {
    this.unsubscribeSubs();
  }

  fetchList() {
    this.unsubscribeSubs();
    this.matches = [];
    this.subs = [];

    if (!this.taxonConceptId) {
      return;
    }

    this.subs.push(this.taxonConceptService.getMatches(this.taxon.id, this.taxonConceptId).subscribe(matches => {
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

  private unsubscribeSubs() {
    for (let i = 0; i < this.subs.length; i++) {
      if (this.subs[i]) {
        this.subs[i].unsubscribe();
      }
    }
  }
}
