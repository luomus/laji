import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'laji-taxonomy',
  template: `
    <div class="container">
      <laji-info-card [taxonId]="taxon" [checklistId]="checklist"></laji-info-card>
    </div>
  `,
  styles: []
})
export class TaxonomyComponent implements OnInit, OnDestroy {

  taxon: string;
  checklist: string;
  private subParam: Subscription;

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.subParam = this.route.queryParams.pipe(
      mergeMap(query => this.route.params.pipe(
        map(params => ({...params, ...query}))
      ))
    ).subscribe((params) => {
        this.taxon = params['id'];
        this.checklist = params['checklist'];
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy() {
    this.subParam.unsubscribe();
  }

}
