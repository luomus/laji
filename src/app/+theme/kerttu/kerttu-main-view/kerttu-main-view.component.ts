import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {IKerttuState, KerttuFacade, Step} from '../service/kerttu.facade';
import {Observable, of, Subscription} from 'rxjs';
import {map, share, switchMap, take} from 'rxjs/operators';
import {Profile} from '../../../shared/model/Profile';
import {UserService} from '../../../shared/service/user.service';
import {PersonApi} from '../../../shared/api/PersonApi';
import {KerttuApi} from '../service/kerttu-api';
import {ILetterCandidate, ILetterTemplate, LetterAnnotation} from '../model/letter';
import {WINDOW} from '@ng-toolkit/universal';
import {AudioService} from '../service/audio.service';

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
  saving = false;

  selectedTaxonIds: string[];

  letterTemplate: ILetterTemplate;
  letterCandidate: ILetterCandidate;
  allLettersAnnotated = false;
  loadingLetters = false;

  errorMsg: string;

  private nextLetterCandidate: ILetterCandidate;
  private nextLetterCandidate$: Observable<ILetterCandidate>;

  private vmSub: Subscription;
  private selectedTaxonIdsSub: Subscription;
  private letterTemplateSub: Subscription;
  private letterCandidateSub: Subscription;
  private nextLetterCandidateSub: Subscription;

  constructor(
    @Inject(WINDOW) private window: Window,
    private kerttuApi: KerttuApi,
    private kerttuFacade: KerttuFacade,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private personService: PersonApi,
    private audioService: AudioService
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
      if (vm.step === Step.fillExpertise && !this.selectedTaxonIdsSub) {
        this.selectedTaxonIdsSub = this.personService.personFindProfileByToken(this.userService.getToken()).subscribe((profile) => {
          this.selectedTaxonIds = profile.taxonExpertise || [];
          this.cdr.markForCheck();
        });
      } else if (vm.step === Step.annotateLetters && !this.letterTemplateSub) {
        this.getLetterTemplate();
      } else if (vm.step === Step.annotateRecordings) {

      }
    });
  }

  ngOnDestroy() {
    if (this.vmSub) {
      this.vmSub.unsubscribe();
    }
    if (this.selectedTaxonIdsSub) {
      this.selectedTaxonIdsSub.unsubscribe();
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
  }

  activate(step: Step) {
    this.kerttuApi.setStatus(this.userService.getToken(), step).subscribe(() => {
      this.kerttuFacade.goToStep(step);
      this.saving = false;
      this.cdr.markForCheck();
    });
  }

  save(currentStep: Step) {
    const observable = this.getSaveObservable(currentStep);
    this.saving = true;
    observable.subscribe(() => {
      this.saving = false;
      this.cdr.markForCheck();
    });
  }

  saveAndGoToNext(currentStep: Step) {
    this.saving = true;
    const observable = this.getSaveObservable(currentStep);
    const nextStep = this.getNextStep(currentStep);

    observable.subscribe(() => {
      this.activate(nextStep);
    });
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

  private getSaveObservable(step: Step): Observable<any> {
    let observable: Observable<any>;
    if (step === Step.fillExpertise) {
      observable = this.saveProfile();
    } else if (step === Step.annotateLetters) {
      observable = this.saveLetterAnnotations();
    } else if (step === Step.annotateRecordings) {
      observable = this.saveRecordingAnnotations();
    }
    return observable;
  }

  private getNextStep(step: Step): Step {
    if (step === Step.fillExpertise) {
      return Step.annotateLetters;
    } else if (step === Step.annotateLetters) {
      return Step.annotateRecordings;
    } else if (step === Step.annotateRecordings) {
      return Step.done;
    }
  }

  private saveProfile() {
    return this.personService.personFindProfileByToken(this.userService.getToken()).pipe(
      switchMap((profile: Profile) => {
        profile.taxonExpertise = this.selectedTaxonIds;
        return this.personService.personUpdateProfileByToken(profile, this.userService.getToken());
      })
    );
  }

  private saveLetterAnnotations() {
    /*if (this.letterAnnotations && Object.keys(this.letterAnnotations).length > 0) {
      return this.kerttuApi.updateLetterAnnotations(this.taxonId, this.letterAnnotations, this.userService.getToken());
    } else {*/
    return of({});
    // }
  }

  private saveRecordingAnnotations() {
    /* if (this.recordingAnnotations && Object.keys(this.recordingAnnotations).length > 0) {
      return this.kerttuApi.updateRecordingAnnotations(this.recordingAnnotations, this.userService.getToken());
    } else { */
    return of({});
    // }
  }

  private getLetterTemplate(skipCurrent = false) {
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
    this.nextLetterCandidate = undefined;
    this.nextLetterCandidate$ = this.kerttuApi.getNextLetterCandidate(this.userService.getToken(), templateId, candidateId)
      .pipe(
        switchMap((candidate) => {
          this.nextLetterCandidate = candidate;
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
      this.window.alert('Kaikki kandidaatit käyty läpi tältä kirjaimelta! Vaihdetaan kirjainta.');
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
