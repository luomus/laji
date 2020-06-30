import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {IKerttuState, KerttuFacade, Step} from '../service/kerttu.facade';
import {Observable, of, Subject, Subscription} from 'rxjs';
import {debounceTime, map, share, switchMap, take, tap} from 'rxjs/operators';
import {Profile} from '../../../shared/model/Profile';
import {UserService} from '../../../shared/service/user.service';
import {PersonApi} from '../../../shared/api/PersonApi';
import {KerttuApi} from '../service/kerttu-api';
import {ILetterCandidate, ILetterTemplate, LetterAnnotation} from '../model/letter';
import {WINDOW} from '@ng-toolkit/universal';
import {AudioService} from '../service/audio.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'laji-kerttu-main-view',
  templateUrl: './kerttu-main-view.component.html',
  styleUrls: ['./kerttu-main-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KerttuMainViewComponent implements OnInit, OnDestroy {
  vm$: Observable<IKerttuState>;

  mapping = {
    [Step.fillExpertise]: 'fillExpertise',
    [Step.annotateLetters]: 'annotateLetters',
    [Step.annotateRecordings]: 'annotateRecordings',
    [Step.done]: 'done'
  };

  steps: {name: string, label: string, returnState: Step}[] = [
    {name: 'fillExpertise', label: 'theme.kerttu.step1', returnState: Step.fillExpertise},
    {name: 'annotateLetters', label: 'theme.kerttu.step2', returnState: Step.annotateLetters},
    {name: 'annotateRecordings', label: 'theme.kerttu.step3', returnState: Step.annotateRecordings},
    {name: 'done', label: 'theme.kerttu.step4', returnState: Step.done}
  ];

  step = Step;
  loading = false;

  selectedTaxonIds: string[];
  savedSelectedTaxonIds: string[];

  letterTemplate: ILetterTemplate;
  letterCandidate: ILetterCandidate;
  allLettersAnnotated = false;
  loadingLetters = false;

  errorMsg: string;

  private profile: Profile;

  private nextLetterCandidate: ILetterCandidate;
  private nextLetterCandidate$: Observable<ILetterCandidate>;

  private vmSub: Subscription;
  private goNextSub: Subscription;

  private selectedTaxonIdsSub: Subscription;
  private selectedTaxonIdsChanged: Subject<string[]> = new Subject<string[]>();
  private saveProfileSub: Subscription;

  private letterTemplateSub: Subscription;
  private letterCandidateSub: Subscription;
  private nextLetterCandidateSub: Subscription;

  private debounceTime = 1000;

  constructor(
    @Inject(WINDOW) private window: Window,
    private kerttuApi: KerttuApi,
    private kerttuFacade: KerttuFacade,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private personService: PersonApi,
    private audioService: AudioService,
    private translate: TranslateService
  ) {
    this.vm$ = kerttuFacade.vm$;
  }

  ngOnInit() {
    this.checkIfWebAudioApiIsSupported();
    this.kerttuFacade.clear();

    this.userService.isLoggedIn$.pipe(take(1)).subscribe(() => {
      this.kerttuApi.getStatus(this.userService.getToken()).subscribe(status => {
        this.kerttuFacade.goToStep(status);
        this.cdr.markForCheck();
      });
    });

    this.vmSub = this.vm$.subscribe(vm => {
      this.clear();

      if (vm.step === Step.fillExpertise) {
        this.selectedTaxonIdsSub = this.personService.personFindProfileByToken(this.userService.getToken()).subscribe((profile) => {
          this.profile = profile;
          this.selectedTaxonIds = profile.taxonExpertise || [];
          this.savedSelectedTaxonIds = this.selectedTaxonIds;
          this.cdr.markForCheck();
        });

        this.saveProfileSub = this.selectedTaxonIdsChanged
          .pipe(
            debounceTime(this.debounceTime),
            switchMap(() => {
              return this.updateTaxonExpertice(this.selectedTaxonIds);
            })
          ).subscribe(() => {
              this.cdr.markForCheck();
            }
          );
      } else if (vm.step === Step.annotateLetters) {
        this.getLetterTemplate();
      } else if (vm.step === Step.annotateRecordings) {

      }
    });
  }

  ngOnDestroy() {
    if (this.vmSub) {
      this.vmSub.unsubscribe();
    }
    if (this.goNextSub) {
      this.goNextSub.unsubscribe();
    }
    this.clear();
  }

  clear() {
    if (this.selectedTaxonIdsSub) {
      this.selectedTaxonIdsSub.unsubscribe();
    }
    if (this.saveProfileSub) {
      this.saveProfileSub.unsubscribe();
    }
    if (this.letterTemplateSub) {
      this.letterTemplateSub.unsubscribe();
    }
    if (this.letterCandidateSub) {
      this.letterCandidateSub.unsubscribe();
    }
    if (this.nextLetterCandidateSub) {
      this.nextLetterCandidateSub.unsubscribe();
    }
    this.selectedTaxonIds = undefined;
    this.savedSelectedTaxonIds = undefined;
    this.letterTemplate = undefined;
    this.letterCandidate = undefined;
    this.allLettersAnnotated = false;
    this.loadingLetters = false;
  }

  activate(step: Step) {
    this.kerttuFacade.goToStep(step);
    this.kerttuApi.setStatus(this.userService.getToken(), step).subscribe(() => {
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  saveAndGoToNext(currentStep: Step) {
    if (this.saveProfileSub) {
      this.saveProfileSub.unsubscribe();
    }

    const nextStep = currentStep + 1;
    this.kerttuFacade.goToStep(nextStep);

    const obs = currentStep === Step.fillExpertise ? this.updateTaxonExpertice(this.selectedTaxonIds) : of({});
    this.loading = true;

    this.goNextSub = obs.pipe(
      switchMap(() => this.kerttuApi.setStatus(this.userService.getToken(), nextStep))
    ).subscribe(() => {
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  goBack(currentStep: Step) {
    this.activate(this.steps[currentStep].returnState - 1);
  }

  onSelectedTaxonIdsChange(selectedTaxonIds: string[]) {
    this.selectedTaxonIds = selectedTaxonIds;
    this.selectedTaxonIdsChanged.next(this.selectedTaxonIds);
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

  skipLetter() {
    this.getLetterTemplate(true);
  }

  private updateTaxonExpertice(selectedTaxonIds): Observable<Profile> {
    if (this.savedSelectedTaxonIds === selectedTaxonIds) {
      return of (this.profile);
    }

    this.profile.taxonExpertise = selectedTaxonIds;
    return this.personService.personUpdateProfileByToken(this.profile, this.userService.getToken()).pipe(
      tap(() => {
        this.savedSelectedTaxonIds = selectedTaxonIds;
      })
    );
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
