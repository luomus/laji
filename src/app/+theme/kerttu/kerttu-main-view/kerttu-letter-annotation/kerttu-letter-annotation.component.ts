import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {LetterAnnotation} from '../../model/letter';
import {ILetterCandidate, ILetterTemplate} from '../../model/letter';
import {ResultService} from '../../../service/result.service';
import {Observable, Subject, Subscription} from 'rxjs';
import {Taxonomy} from '../../../../shared/model/Taxonomy';
import {debounceTime} from 'rxjs/operators';

@Component({
  selector: 'laji-kerttu-letter-annotation',
  templateUrl: './kerttu-letter-annotation.component.html',
  styleUrls: ['./kerttu-letter-annotation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KerttuLetterAnnotationComponent implements OnInit, OnDestroy, OnChanges {
  @Input() template: ILetterTemplate;
  @Input() candidate: ILetterCandidate;
  @Input() letterAnnotationCount: number;

  currentAnnotation: LetterAnnotation;
  annotation = LetterAnnotation;

  loadingTemplate = false;
  loadingCandidate = false;
  candidateLongerVisible = false;

  candidateYRange: number[];

  zoomed = false;
  xRangePadding = 0.5;

  taxon$: Observable<Taxonomy>;

  @Output() annotationChange = new EventEmitter<LetterAnnotation>();
  @Output() skipLetterClick = new EventEmitter();

  private xRangePaddingChanged: Subject<number> = new Subject<number>();
  private xRangePaddingChangeSub: Subscription;
  private debounceTime = 500;

  constructor(
    private resultService: ResultService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.xRangePaddingChangeSub = this.xRangePaddingChanged
      .pipe(
        debounceTime(this.debounceTime),
      )
      .subscribe((xRangePadding) => {
        this.xRangePadding = xRangePadding;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy() {
    this.xRangePaddingChangeSub.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
      this.currentAnnotation = undefined;
      this.candidateLongerVisible = false;
      this.cdr.markForCheck();
    }, 0);
    if (changes.template && this.template) {
      this.taxon$ = this.resultService.getTaxon(this.template.taxonId);
    }
    if (this.template && this.candidate) {
      this.candidateYRange = [
        this.template.yRange[0] + this.candidate.yDiff, this.template.yRange[1] + this.candidate.yDiff
      ];
    }
  }

  onXRangePaddingChange(value: number) {
    this.xRangePaddingChanged.next(value);
  }
}
