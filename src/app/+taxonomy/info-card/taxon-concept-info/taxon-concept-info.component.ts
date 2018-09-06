import { ChangeDetectorRef, Component, Input, OnChanges } from '@angular/core';
import { TaxonConceptService } from './taxon-concept.service';
import { TaxonMatch } from './taxon-match.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'laji-taxon-concept-info',
  templateUrl: './taxon-concept-info.component.html',
  styleUrls: ['./taxon-concept-info.component.css'],
  providers: [TaxonConceptService]
})
export class TaxonConceptInfoComponent implements OnChanges {
  @Input() taxonId: string;
  @Input() taxonConceptId: string;

  matches: TaxonMatch[];

  private subs: Subscription[] = [];

  constructor(
    private taxonConceptService: TaxonConceptService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnChanges() {
    this.fetchList();
  }

  fetchList() {
    for (let i = 0; i < this.subs.length; i++) {
      if (this.subs[i]) {
        this.subs[i].unsubscribe();
      }
    }
    this.matches = [];
    this.subs = [];

    this.subs.push(this.taxonConceptService.getMatches(this.taxonId, this.taxonConceptId).subscribe(matches => {
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
