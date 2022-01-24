import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { TaxonConceptService } from './taxon-concept.service';
import { TaxonMatch } from './taxon-match.model';
import { of, Subscription } from 'rxjs';
import { Taxonomy } from '../../../../../shared/model/Taxonomy';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'laji-taxon-concept-info',
  templateUrl: './taxon-concept-info.component.html',
  styleUrls: ['./taxon-concept-info.component.css'],
  providers: [TaxonConceptService],
  changeDetection: ChangeDetectionStrategy.OnPush
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

    this.subs.push(
      this.taxonConceptService.getMatches(this.taxon.id, this.taxonConceptId)
        .pipe(catchError(() => of([])))
        .subscribe(matches => {
          if (matches.length === 0) {
            this.cd.markForCheck();
          }

          for (const match of matches) {

            this.subs.push(this.taxonConceptService.getMatchInfo(match).pipe(catchError(() => of(undefined))).subscribe(info => {
              if (info) {
                this.matches.push(info);
              }
              this.cd.markForCheck();
            }));
          }
        }));
  }

  private unsubscribeSubs() {
    for (const sub of this.subs) {
      sub?.unsubscribe();
    }
  }
}
