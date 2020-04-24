import {ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Annotation} from '../../model/annotation';
import {ILetter, ILetterTemplate} from '../../model/letter';

@Component({
  selector: 'laji-kerttu-letter-annotation',
  templateUrl: './kerttu-letter-annotation.component.html',
  styleUrls: ['./kerttu-letter-annotation.component.scss']
})
export class KerttuLetterAnnotationComponent implements OnChanges {
  @Input() template: ILetterTemplate;
  @Input() candidate: ILetter;

  currentAnnotation: Annotation;

  annotation = Annotation;

  loadingTemplate = false;
  loadingCandidate = false;

  @Output() annotationChange = new EventEmitter<Annotation>();

  constructor(
    private cdr: ChangeDetectorRef
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
      this.currentAnnotation = undefined;
    }, 0);
  }
}
