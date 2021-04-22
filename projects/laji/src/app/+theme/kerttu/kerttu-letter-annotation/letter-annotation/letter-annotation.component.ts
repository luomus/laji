import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ILetterStatusInfo, LetterAnnotation } from '../../models';
import { ILetterCandidate, ILetterTemplate } from '../../models';
import { Observable } from 'rxjs';
import { Taxonomy } from '../../../../shared/model/Taxonomy';
import { TranslateService } from '@ngx-translate/core';
import { KerttuTaxonService } from '../../service/kerttu-taxon-service';

@Component({
  selector: 'laji-letter-annotation',
  templateUrl: './letter-annotation.component.html',
  styleUrls: ['./letter-annotation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LetterAnnotationComponent implements OnChanges {
  @Input() template: ILetterTemplate;
  @Input() candidate: ILetterCandidate;
  @Input() statusInfo: ILetterStatusInfo;

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

  constructor(
    private translate: TranslateService,
    private taxonService: KerttuTaxonService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    this.candidateLongerVisible = false;

    if (changes.template && this.template) {
      this.autoplayCandidate = false;
      this.taxon$ = this.taxonService.getTaxon(this.template.taxonId);
    }
  }

  onSkipLetter() {
    if (confirm(this.translate.instant('theme.kerttu.confirmSkipLetter'))) {
      this.skipLetterClick.emit();
    }
  }

  onAnnotationChange(annotation: LetterAnnotation) {
    this.autoplayCandidate = true;
    this.annotationChange.emit(annotation);
  }

  setDefaultSettings() {
    this.zoomed = true;
    this.xRangePadding = 1;
  }
}
