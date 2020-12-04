import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { ILetterCandidate, ILetterStatusInfo, ILetterTemplate, LetterAnnotation } from '../../models';
import { Observable, Subject, Subscription } from 'rxjs';
import { Taxonomy } from '../../../../shared/model/Taxonomy';
import { debounceTime } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { KerttuTaxonService } from '../../service/kerttu-taxon-service';

@Component({
  selector: 'laji-letter-annotation',
  templateUrl: './letter-annotation.component.html',
  styleUrls: ['./letter-annotation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LetterAnnotationComponent implements OnInit, OnDestroy, OnChanges {
  @Input() template: ILetterTemplate;
  @Input() candidate: ILetterCandidate;
  @Input() statusInfo: ILetterStatusInfo;

  currentAnnotation: LetterAnnotation;
  annotation = LetterAnnotation;

  loadingTemplate = false;
  loadingCandidate = false;
  candidateLongerVisible = false;
  autoplayCandidate = false;

  zoomed = true;
  xRangePadding = 1;

  taxon$: Observable<Taxonomy>;

  @Output() annotationChange = new EventEmitter<LetterAnnotation>();
  @Output() skipLetterClick = new EventEmitter();
  @Output() backToPreviousCandidateClick = new EventEmitter();

  private xRangePaddingChanged: Subject<number> = new Subject<number>();
  private xRangePaddingChangeSub: Subscription;
  private debounceTime = 500;

  constructor(
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
    private taxonService: KerttuTaxonService
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
      this.autoplayCandidate = false;
      this.taxon$ = this.taxonService.getTaxon(this.template.taxonId);
    }
  }

  onXRangePaddingChange(value: string) {
    this.xRangePadding = parseFloat(value);
    this.xRangePaddingChanged.next(this.xRangePadding);
  }

  onSkipLetter() {
    if (confirm(this.translate.instant('theme.kerttu.confirmSkipLetter'))) {
      this.skipLetterClick.emit();
    }
  }

  onAnnotationChange(annotation: LetterAnnotation) {
    this.autoplayCandidate = true;
    this.currentAnnotation = annotation;
    this.annotationChange.emit(annotation);
  }

  setDefaultSettings() {
    this.zoomed = true;
    this.xRangePadding = 1;
  }
}
