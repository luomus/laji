import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { toHtmlSelectElement } from 'projects/laji/src/app/shared/service/html-element.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { map, switchMap } from 'rxjs/operators';
import { BirdPointCountResultService } from '../bird-point-count-result.service';

@Component({
  selector: 'laji-bird-point-count-result-censuses',
  templateUrl: './bird-point-count-result-censuses.component.html',
  styleUrls: ['./bird-point-count-result-censuses.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BirdPointCountResultCensusesComponent implements OnInit, OnChanges {
  @Input() collections: string[];
  @Input() collectionStartYear: number;
  @Input() year: string | undefined;

  @Output() yearChange = new EventEmitter<string>();

  readonly year$ = new BehaviorSubject<string | undefined>(undefined);

  resultSub: Subscription;
  rows: any[];
  selected = [
    'document.namedPlace.name',
    'document.namedPlace.municipalityDisplayName',
    'document.namedPlace.birdAssociationAreaDisplayName',
    'gathering.eventDate.begin',
    'document.modifiedDate',
    'count',
    'individualCountSum'
  ];
  sorts: {prop: string; dir: 'asc'|'desc'}[] = [
    {prop: 'document.modifiedDate', dir: 'desc'}
  ];
  yearOptions: { label: string; value: string }[];
  defaultYear: string;
  loading = false;

  toHtmlSelectElement = toHtmlSelectElement;

  constructor(
    private resultService: BirdPointCountResultService,
    private cd: ChangeDetectorRef,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.defaultYear = this.year$.getValue() !== undefined ? this.year$.getValue() : '';
    const currentYear = new Date().getFullYear();

    this.onFilterChange();

    const yearsFromStartYear = [''].concat(
      Array.from(
        { length: currentYear - +this.collectionStartYear + 1 },
        (_, i) => (+this.collectionStartYear + i).toString()
      ).reverse()
    );

    this.yearOptions = yearsFromStartYear.map(v => {
      if (v === '') {
        return { label: this.translate.instant('result.map.year.empty.label'), value: '' };
      } else {
        return { label: v, value: v };
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['year']) {
      this.year$.next(changes['year'].currentValue);
    }
  }

  onFilterChange() {
    if (this.resultSub) {
      this.resultSub.unsubscribe();
    }

    this.loading = true;

    this.resultSub = this.year$.pipe(
      switchMap((year) => this.resultService.getCensusList(year ? +year : undefined).pipe(
        map((list) => {
          this.rows = list;
          this.loading = false;
          this.cd.markForCheck();
        })
      ))
    ).subscribe();
  }

  onYearChange(event: Event): void {
    const year = this.toHtmlSelectElement(event.target).value;
    this.yearChange.emit(year);
  }
}
