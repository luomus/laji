import {ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {KerttuApi} from '../kerttu-api';
import {UserService} from '../../../shared/service/user.service';
import {Observable} from 'rxjs';
import {IRecordingWithCandidates} from '../model/recording';
import {Annotation, ILetterAnnotations} from '../model/annotation';
import {tap} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'laji-kerttu-letter-annotation',
  templateUrl: './kerttu-letter-annotation.component.html',
  styleUrls: ['./kerttu-letter-annotation.component.scss']
})
export class KerttuLetterAnnotationComponent implements OnChanges {
  @Input() taxonId: string;
  letters$: Observable<IRecordingWithCandidates[]>;

  currentTemplate = 0;
  currentCandidate = 0;
  currentAnnotation: Annotation = undefined;

  annotation = Annotation;

  private annotations: ILetterAnnotations = {};
  private letters: IRecordingWithCandidates[];
  private letterQueue: {templateIdx: number, candidateIdx: number}[];
  private alertShown = false;

  @Output() annotationsChange = new EventEmitter<ILetterAnnotations>();

  constructor(
    private kerttuApi: KerttuApi,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private translateService: TranslateService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.taxonId) {
      if (this.taxonId) {
        this.letters$ = this.kerttuApi.getLetterCandidates(this.taxonId, this.userService.getToken()).pipe(
          tap((letters: IRecordingWithCandidates[])  => {
            this.letters = letters;
            this.letterQueue = [];
            this.letters.forEach((letter, i) => {
              letter.candidates.forEach((candidate, j) => {
                this.letterQueue.push({templateIdx: i, candidateIdx: j});
              });
            });
            this.alertShown = false;
          })
        );
      }
    }
  }

  onAnnotationChange(annotation: Annotation) {
    this.currentAnnotation = annotation;
    this.setAnnotation();
    this.letterQueue = this.letterQueue.filter(q => !(q.templateIdx === this.currentTemplate && q.candidateIdx === this.currentCandidate));

    setTimeout(() => {
      if (this.letterQueue.length === 0 && !this.alertShown) {
        alert(this.translateService.instant('theme.kerttu.letterQueueEmpty'));
        this.alertShown = true;
      }

      const next = this.letterQueue[0];
      this.currentTemplate = next.templateIdx;
      this.currentCandidate = next.candidateIdx;
      this.currentAnnotation = this.getAnnotation();
      this.cdr.markForCheck();
    }, 0);
  }

  onCandidateChange(idx: string) {
    this.currentCandidate = parseInt(idx, 10);
    this.currentAnnotation = this.getAnnotation();
  }

  onTemplateChange(idx: string) {
    this.currentTemplate = parseInt(idx, 10);
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

