import {Component, OnInit, ChangeDetectionStrategy, Inject, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {map, share, switchMap} from 'rxjs/operators';
import {ILetterCandidate, ILetterTemplate, LetterAnnotation} from '../model/letter';
import {Observable, of, Subscription} from 'rxjs';
import {WINDOW} from '@ng-toolkit/universal';
import {KerttuApi} from '../service/kerttu-api';
import {UserService} from '../../../shared/service/user.service';
import {AudioService} from '../service/audio.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'laji-kerttu-letter-annotation',
  templateUrl: './kerttu-letter-annotation.component.html',
  styleUrls: ['./kerttu-letter-annotation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KerttuLetterAnnotationComponent implements OnInit, OnDestroy {
  selectedTaxonIds: string[];
  savedSelectedTaxonIds: string[];

  letterTemplate: ILetterTemplate;
  letterCandidate: ILetterCandidate;
  allLettersAnnotated = false;
  loadingLetters = false;

  errorMsg: string;

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
    this.checkIfWebAudioApiIsSupported();
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

  onLetterAnnotationChange(annotation: LetterAnnotation) {
    const candidateId = this.letterCandidate.id;
    this.letterCandidate = undefined;
    this.kerttuApi.setLetterAnnotation(this.userService.getToken(), this.letterTemplate.id, candidateId, annotation)
      .subscribe((response) => {
        const info = response.info;
        this.letterTemplate.info = info;
        if (info.userAnnotationCount === info.targetAnnotationCount) {
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
      .subscribe(template => {
        if (!template) {
          this.allLettersAnnotated = true;
        } else {
          this.getLetterCandidate(template.id);
        }
        this.letterTemplate = template;
        this.cdr.markForCheck();
      });
  }

  private getLetterCandidate(templateId: number) {
    this.letterCandidate = undefined;

    this.letterCandidateSub = this.kerttuApi.getLetterCandidate(this.userService.getToken(), templateId).subscribe(candidate => {
      this.onCandidateLoad(candidate);
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
        switchMap((candidate) => {
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
    const msg = error.error?.message;
    if (msg === 'InvalidTemplateIdError' || msg === 'InvalidCandidateIdError') {
      this.getLetterTemplate();
    }
  }

  private checkIfWebAudioApiIsSupported() {
    if (!this.audioService.audioContext) {
      this.errorMsg = 'theme.kerttu.notSupported';
    }
  }
}
