import {Component, OnInit, ChangeDetectionStrategy, Inject, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {map, share, switchMap} from 'rxjs/operators';
import {ILetterCandidate, ILetterStatusInfo, ILetterTemplate, LetterAnnotation} from '../models';
import {Observable, of, Subscription} from 'rxjs';
import {WINDOW} from '@ng-toolkit/universal';
import {KerttuApi} from '../service/kerttu-api';
import {UserService} from '../../../shared/service/user.service';
import {AudioService} from '../audio-viewer/service/audio.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'laji-kerttu-letter-annotation',
  templateUrl: './kerttu-letter-annotation.component.html',
  styleUrls: ['./kerttu-letter-annotation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KerttuLetterAnnotationComponent implements OnInit, OnDestroy {
  letterTemplate: ILetterTemplate;
  letterCandidate: ILetterCandidate;
  statusInfo: ILetterStatusInfo;

  taxonExpertiseMissing = false;
  allLettersAnnotated = false;
  loadingLetters = false;
  firstTemplateLoaded = false;

  hasError = false;

  private nextLetterCandidate: ILetterCandidate;
  private nextLetterCandidate$: Observable<ILetterCandidate>;

  private letterTemplateSub: Subscription;
  private letterCandidateSub: Subscription;
  private nextLetterCandidateSub: Subscription;

  constructor(
    @Inject(WINDOW) private window: Window,
    private kerttuApi: KerttuApi,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private audioService: AudioService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.getLetterTemplate();
  }

  ngOnDestroy() {
    if (this.letterTemplateSub) {
      this.letterTemplateSub.unsubscribe();
    }
    if (this.letterCandidateSub) {
      this.letterCandidateSub.unsubscribe();
    }
    if (this.nextLetterCandidateSub) {
      this.nextLetterCandidateSub.unsubscribe();
    }
  }

  skipLetter() {
    this.getLetterTemplate(true);
  }

  goBackToPreviousCandidate() {
    if (this.nextLetterCandidateSub) {
      this.nextLetterCandidateSub.unsubscribe();
    }

    const currentCandidate = this.letterCandidate;
    this.letterCandidate = undefined;
    this.loadingLetters = true;

    this.letterCandidateSub = this.kerttuApi.getPreviousLetterCandidate(this.userService.getToken(), this.letterTemplate.id, currentCandidate.id).subscribe(result => {
      if (!result.candidate) {
        this.getLetterTemplate();
        return;
      }
      this.letterCandidate = result.candidate;
      this.statusInfo = result.statusInfo;
      this.nextLetterCandidate = currentCandidate;
      this.loadingLetters = false;
      this.cdr.markForCheck();
    }, error => {
      this.onLetterError(error);
    });
  }

  onLetterAnnotationChange(annotation: LetterAnnotation) {
    const candidateId = this.letterCandidate.id;
    this.letterCandidate = undefined;
    this.kerttuApi.setLetterAnnotation(this.userService.getToken(), this.letterTemplate.id, candidateId, annotation)
      .subscribe((response) => {
        this.statusInfo = response.statusInfo;
        if (this.statusInfo.userAnnotationCount === this.statusInfo.targetAnnotationCount) {
          this.onCandidateLoad(undefined);
          return;
        }

        const obs = this.nextLetterCandidate !== undefined ? of(this.nextLetterCandidate) : this.nextLetterCandidate$;
        this.letterCandidateSub = obs.subscribe(candidate => {
          this.onCandidateLoad(candidate);
        }, error => {
          this.onLetterError(error);
        });
      }, error => {
        this.onLetterError(error);
      });
  }

  private getLetterTemplate(skipCurrent = false) {
    if (this.letterCandidateSub) {
      this.letterCandidateSub.unsubscribe();
    }
    if (this.nextLetterCandidateSub) {
      this.nextLetterCandidateSub.unsubscribe();
    }

    const personToken = this.userService.getToken();
    const obs = skipCurrent ? this.kerttuApi.skipLetterTemplate(personToken, this.letterTemplate.id)
      : this.kerttuApi.getLetterTemplate(personToken);

    this.letterTemplate = undefined;
    this.loadingLetters = true;

    this.letterTemplateSub = obs
      .subscribe(result => {
        const template = result.template;
        if (!template) {
          this.allLettersAnnotated = true;
        } else {
          this.firstTemplateLoaded = true;
          this.getLetterCandidate(template.id);
        }
        this.letterTemplate = template;
        this.statusInfo = result.statusInfo;
        this.cdr.markForCheck();
      }, error => {
        if (this.getErrorMessage(error) === 'TaxonExpertiseMissingError') {
          this.taxonExpertiseMissing = true;
        } else {
          this.hasError = true;
        }
        this.cdr.markForCheck();
      });
  }

  private getLetterCandidate(templateId: number) {
    this.letterCandidate = undefined;

    this.letterCandidateSub = this.kerttuApi.getLetterCandidate(this.userService.getToken(), templateId).subscribe(result => {
      this.onCandidateLoad(result.candidate);
    }, error => {
      this.onLetterError(error);
    });
  }

  private getNextLetterCandidate(templateId: number, candidateId: number) {
    if (this.nextLetterCandidateSub) {
      this.nextLetterCandidateSub.unsubscribe();
    }

    this.nextLetterCandidate = undefined;
    this.nextLetterCandidate$ = this.kerttuApi.getNextLetterCandidate(this.userService.getToken(), templateId, candidateId)
      .pipe(
        switchMap((result) => {
          const candidate = result.candidate;
          return this.audioService.getAudioBuffer(candidate.recording).pipe(map(() => candidate));
        }),
        share()
      );
    this.nextLetterCandidateSub = this.nextLetterCandidate$.subscribe((candidate) => {
      this.nextLetterCandidate = candidate || null;
    }, error => {
      this.onLetterError(error);
    });
  }

  private onCandidateLoad(candidate) {
    if (!candidate) {
      this.window.alert(this.translate.instant('theme.kerttu.allCandidatesAnnotated'));
      this.getLetterTemplate();
      return;
    } else {
      this.getNextLetterCandidate(this.letterTemplate.id, candidate.id);
    }

    this.letterCandidate = candidate;
    this.loadingLetters = false;
    this.cdr.markForCheck();
  }

  private onLetterError(error) {
    const msg = this.getErrorMessage(error);
    if (msg === 'InvalidTemplateIdError' || msg === 'InvalidCandidateIdError') {
      this.getLetterTemplate();
    } else {
      this.hasError = true;
    }
    this.cdr.markForCheck();
  }

  private getErrorMessage(error) {
    while (error.error) {
      error = error.error;
    }
    return error.message || error.body?.message;
  }
}
