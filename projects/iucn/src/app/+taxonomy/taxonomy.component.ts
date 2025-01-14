import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { ChecklistYear, DEFAULT_YEAR, ResultService } from '../iucn-shared/service/result.service';

@Component({
  selector: 'iucn-taxonomy',
  template: `
    <iucn-simple-omni></iucn-simple-omni>
    <div class="container">
      <iucn-info-card [taxonId]="taxon" [year]="year.toString()" [checklistId]="checklist"></iucn-info-card>
    </div>
  `,
  styles: []
})
export class TaxonomyComponent implements OnInit, OnDestroy {

  taxon!: string;
  checklist!: string;
  year!: ChecklistYear;
  private subParam!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private resultService: ResultService
  ) { }

  ngOnInit() {
    this.subParam = this.route.queryParams.pipe(
      mergeMap(query => this.route.params.pipe(
        map(params => ({...params, ...query}))
      ))
    ).subscribe((params) => {
      this.taxon = params['id'];
      this.year = params['year'] || DEFAULT_YEAR;
      this.checklist = this.resultService.getChecklistVersion(this.year);
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.subParam.unsubscribe();
  }

}
