import {ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {LetterAnnotation} from '../../model/letter';
import {ILetterCandidate, ILetterTemplate} from '../../model/letter';
import {ResultService} from '../../../service/result.service';
import {Observable} from 'rxjs';
import {Taxonomy} from '../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-kerttu-letter-annotation',
  templateUrl: './kerttu-letter-annotation.component.html',
  styleUrls: ['./kerttu-letter-annotation.component.scss']
})
export class KerttuLetterAnnotationComponent implements OnChanges {
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

  taxon$: Observable<Taxonomy>;

  @Output() annotationChange = new EventEmitter<LetterAnnotation>();
  @Output() skipLetterClick = new EventEmitter();

  constructor(
    private resultService: ResultService,
    private cdr: ChangeDetectorRef
  ) { }

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
}
