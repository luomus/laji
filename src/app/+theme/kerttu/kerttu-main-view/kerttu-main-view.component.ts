import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import { IKerttuState, KerttuFacade, Step } from '../kerttu.facade';
import {Observable} from 'rxjs';

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

  constructor(
    private kerttuFacade: KerttuFacade,
    private cdr: ChangeDetectorRef
  ) {
    this.vm$ = kerttuFacade.vm$;
  }

  ngOnInit() {
    this.kerttuFacade.clear();
  }

  activate(step: Step) {
    this.kerttuFacade.goToStep(step);
    this.cdr.markForCheck();
  }
}
