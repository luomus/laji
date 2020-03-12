import {ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {UserService} from '../../../shared/service/user.service';
import {IRecordingWithCandidates} from '../model/recording';
import {Annotation, ILetterAnnotations} from '../model/annotation';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'laji-kerttu-letter-annotation',
  templateUrl: './kerttu-letter-annotation.component.html',
  styleUrls: ['./kerttu-letter-annotation.component.scss']
})
export class KerttuLetterAnnotationComponent implements OnChanges {
  @Input() annotations: ILetterAnnotations;
  @Input() letters: IRecordingWithCandidates[];

  currentTemplate = 0;
  currentCandidate = 0;
  currentAnnotation: Annotation = undefined;

  annotation = Annotation;

  private letterQueue: {templateIdx: number, candidateIdx: number}[];
  private alertShown = false;

  @Output() annotationsChange = new EventEmitter<ILetterAnnotations>();

  constructor(
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private translateService: TranslateService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.letters && this.letters) {
      this.letterQueue = [];
      this.letters.forEach((letter, i) => {
        letter.candidates.forEach((candidate, j) => {
          this.letterQueue.push({templateIdx: i, candidateIdx: j});
        });
      });

      this.currentTemplate = 0;
      this.currentCandidate = 0;
      this.alertShown = false;
    }
    if (this.letters && this.annotations) {
      this.currentAnnotation = this.getAnnotation();
    }
  }

  onAnnotationChange(annotation: Annotation) {
    this.currentAnnotation = annotation;
    this.setAnnotation();
    this.letterQueue = this.letterQueue.filter(q => !(q.templateIdx === this.currentTemplate && q.candidateIdx === this.currentCandidate));

    setTimeout(() => {
      if (this.letterQueue.length === 0) {
        if (!this.alertShown) {
          alert(this.translateService.instant('theme.kerttu.letterQueueEmpty'));
          this.alertShown = true;
        }
      } else {
        const next = this.letterQueue[0];
        this.currentTemplate = next.templateIdx;
        this.currentCandidate = next.candidateIdx;
        this.currentAnnotation = this.getAnnotation();
      }
      this.cdr.markForCheck();
    }, 0);
  }

  onCandidateChange(idx: string) {
    this.currentCandidate = parseInt(idx, 10);
    this.currentAnnotation = this.getAnnotation();
  }

  onTemplateChange(idx: string) {
    this.currentTemplate = parseInt(idx, 10);
    this.currentCandidate = 0;
    this.currentAnnotation = this.getAnnotation();
  }

  private getAnnotation(templateIdx = this.currentTemplate, candidateIdx = this.currentCandidate): Annotation {
    const templateId = this.letters[templateIdx].template.id;
    const candidateId = this.letters[templateIdx].candidates[candidateIdx].id;

    if (this.annotations[templateId]) {
      return this.annotations[templateId][candidateId];
    }
  }

  private setAnnotation(templateIdx = this.currentTemplate, candidateIdx = this.currentCandidate, annotation = this.currentAnnotation) {
    const templateId = this.letters[templateIdx].template.id;
    const candidateId = this.letters[templateIdx].candidates[candidateIdx].id;

    if (!this.annotations[templateId]) {
      this.annotations[templateId] = {};
    }
    this.annotations[templateId][candidateId] = annotation;

    this.annotationsChange.emit(this.annotations);
  }
}

