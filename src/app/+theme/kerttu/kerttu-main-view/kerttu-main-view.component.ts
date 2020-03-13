import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {IKerttuState, KerttuFacade, Step} from '../kerttu.facade';
import {forkJoin, Observable, of, Subscription} from 'rxjs';
import {switchMap, take} from 'rxjs/operators';
import {Profile} from '../../../shared/model/Profile';
import {UserService} from '../../../shared/service/user.service';
import {PersonApi} from '../../../shared/api/PersonApi';
import {KerttuApi} from '../kerttu-api';
import {ILetterAnnotations, IRecordingAnnotations} from '../model/annotation';
import {IRecording, IRecordingWithCandidates} from '../model/recording';

@Component({
  selector: 'laji-kerttu-main-view',
  templateUrl: './kerttu-main-view.component.html',
  styleUrls: ['./kerttu-main-view.component.scss']
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
  selectedTaxonIds: string[];
  taxonId: string;

  letters$: Observable<IRecordingWithCandidates[]>;
  letterAnnotations: ILetterAnnotations;

  recordings$: Observable<IRecording[]>;
  recordingAnnotations: IRecordingAnnotations;

  saving = false;

  private letterAnnotationsSub: Subscription;
  private recordingAnnotationSub: Subscription;

  constructor(
    private kerttuApi: KerttuApi,
    private kerttuFacade: KerttuFacade,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private personService: PersonApi
  ) {
    this.vm$ = kerttuFacade.vm$;
  }

  ngOnInit() {
    this.kerttuFacade.clear();

    this.userService.isLoggedIn$.pipe(take(1)).subscribe(() => {
      forkJoin([
        this.kerttuApi.getStatus(this.userService.getToken()),
        this.personService.personFindProfileByToken(this.userService.getToken())
      ]).subscribe(([status, profile]) => {
        this.selectedTaxonIds = profile.taxonExpertise;
        this.kerttuFacade.goToStep(status);
      });
    });

    this.vm$.subscribe(vm => {
      if (vm.step === Step.annotateRecordings) {
        this.recordings$ = this.kerttuApi.getRecordings(this.selectedTaxonIds, this.userService.getToken());
        this.recordingAnnotationSub = this.kerttuApi.getRecordingAnnotations(this.userService.getToken()).subscribe((annotations: IRecordingAnnotations) => {
          this.recordingAnnotations = annotations;
          this.cdr.markForCheck();
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.letterAnnotationsSub) {
      this.letterAnnotationsSub.unsubscribe();
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

  saveProfile() {
    return this.personService.personFindProfileByToken(this.userService.getToken()).pipe(
      switchMap((profile: Profile) => {
        profile.taxonExpertise = this.selectedTaxonIds;
        return this.personService.personUpdateProfileByToken(profile, this.userService.getToken());
      })
    );
  }

  saveLetterAnnotations() {
    if (this.letterAnnotations && Object.keys(this.letterAnnotations).length > 0) {
      return this.kerttuApi.updateLetterAnnotations(this.taxonId, this.letterAnnotations, this.userService.getToken());
    } else {
      return of({});
    }
  }

  saveRecordingAnnotations() {
    if (this.recordingAnnotations && Object.keys(this.recordingAnnotations).length > 0) {
      return this.kerttuApi.updateRecordingAnnotations(this.recordingAnnotations, this.userService.getToken());
    } else {
      return of({});
    }
  }

  onTaxonIdChange(id: string) {
    if (this.letterAnnotationsSub) {
      this.letterAnnotationsSub.unsubscribe();
    }

    this.saveLetterAnnotations().subscribe();

    this.taxonId = id;
    this.letterAnnotations = undefined;
    if (this.taxonId) {
      this.letterAnnotationsSub = this.kerttuApi.getLetterAnnotations(id, this.userService.getToken()).subscribe((annotations: ILetterAnnotations) => {
        this.letterAnnotations = annotations;
        this.cdr.markForCheck();
      });
      this.letters$ = this.kerttuApi.getLetterCandidates(this.taxonId, this.userService.getToken());
    }
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
}
