import {ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {LetterAnnotation} from '../../model/letter';
import {ILetter, ILetterTemplate} from '../../model/letter';

@Component({
  selector: 'laji-kerttu-letter-annotation',
  templateUrl: './kerttu-letter-annotation.component.html',
  styleUrls: ['./kerttu-letter-annotation.component.scss']
})
export class KerttuLetterAnnotationComponent implements OnChanges {
  @Input() template: ILetterTemplate;
  @Input() candidate: ILetter;

  currentAnnotation: LetterAnnotation;

  annotation = LetterAnnotation;

  loadingTemplate = false;
  loadingCandidate = false;

  @Output() annotationChange = new EventEmitter<LetterAnnotation>();

  constructor(
    private cdr: ChangeDetectorRef
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
      this.currentAnnotation = undefined;
    }, 0);
  }
}
