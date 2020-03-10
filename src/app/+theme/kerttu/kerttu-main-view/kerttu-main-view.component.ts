import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { IKerttuState, KerttuFacade, Step } from '../kerttu.facade';
import {forkJoin, Observable} from 'rxjs';
import {switchMap, take} from 'rxjs/operators';
import {Profile} from '../../../shared/model/Profile';
import {UserService} from '../../../shared/service/user.service';
import {PersonApi} from '../../../shared/api/PersonApi';
import {KerttuApi} from '../kerttu-api';

@Component({
  selector: 'laji-kerttu-main-view',
  templateUrl: './kerttu-main-view.component.html',
  styleUrls: ['./kerttu-main-view.component.scss']
})
export class KerttuMainViewComponent implements OnInit {
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
  }

  activate(step: Step) {
    this.kerttuApi.setStatus(this.userService.getToken(), step).subscribe(() => {
      this.kerttuFacade.goToStep(step);
      this.cdr.markForCheck();
    });
  }

  save(currentStep: Step) {
    if (currentStep === Step.fillExpertise) {
      this.saveProfile().subscribe(() => {

      });
    } else if (currentStep === Step.annotateLetters) {

    } else if (currentStep === Step.annotateRecordings) {

    }
  }

  saveAndGoToNext(currentStep: Step) {
    if (currentStep === Step.fillExpertise) {
      this.saveProfile().subscribe(() => {
        this.activate(Step.annotateLetters);
      });
    } else if (currentStep === Step.annotateLetters) {
      this.activate(Step.annotateRecordings);
    } else if (currentStep === Step.annotateRecordings) {
      this.activate(Step.done);
    }
  }

  saveProfile() {
    return this.personService.personFindProfileByToken(this.userService.getToken()).pipe(
      switchMap((profile: Profile) => {
        profile.taxonExpertise = this.selectedTaxonIds;
        return this.personService.personUpdateProfileByToken(profile, this.userService.getToken());
      })
    );
  }
}
