import {ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {LetterAnnotation} from '../../model/letter';
import {ILetterCandidate, ILetterCandidateTemplate} from '../../model/letter';
import {ResultService} from '../../../service/result.service';
import {Observable} from 'rxjs';
import {Taxonomy} from '../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-kerttu-letter-annotation',
  templateUrl: './kerttu-letter-annotation.component.html',
  styleUrls: ['./kerttu-letter-annotation.component.scss']
})
export class KerttuLetterAnnotationComponent implements OnChanges {
  @Input() template: ILetterCandidateTemplate;
  @Input() candidate: ILetterCandidate;

  currentAnnotation: LetterAnnotation;
  annotation = LetterAnnotation;

  loadingTemplate = false;
  loadingCandidate = false;

  taxon$: Observable<Taxonomy>;

  @Output() annotationChange = new EventEmitter<LetterAnnotation>();

  constructor(
    private resultService: ResultService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
      this.currentAnnotation = undefined;
      this.cdr.markForCheck();
    }, 0);
    if (changes.template && this.template) {
      this.taxon$ = this.resultService.getTaxon(this.template.taxonId);
    }
  }
}
