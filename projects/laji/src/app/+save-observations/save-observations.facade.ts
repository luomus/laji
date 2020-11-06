import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { FormService } from '../shared/service/form.service';
import { Form } from '../shared/model/Form';

interface State {
  citizenScienceForms: Form.List[];
  birdMonitoringForms: Form.List[];
  researchProjectForms: Form.List[];
}

@Injectable()
export class SaveObservationsFacade {
  private store$ = new BehaviorSubject<State>({
    citizenScienceForms: [],
    birdMonitoringForms: [],
    researchProjectForms: []
  });

  citizenScienceForms$ = this.store$.asObservable().pipe(map(state => state.citizenScienceForms), distinctUntilChanged());
  birdMonitoringForms$ = this.store$.asObservable().pipe(map(state => state.birdMonitoringForms), distinctUntilChanged());
  researchProjectForms$ = this.store$.asObservable().pipe(map(state => state.researchProjectForms), distinctUntilChanged());

  constructor (private formService: FormService, private translate: TranslateService) {

  }

  reducer(forms) {
    this.store$.next({
      citizenScienceForms: forms[0],
      birdMonitoringForms: forms[1],
      researchProjectForms: forms[2]
    });
  }

  loadAll() {
    this.formService.getAllForms(this.translate.currentLang).pipe(
      map((forms) => {
        const c = [];
        const d = [];
        const r = [];
        forms.sort((a, b) =>
          a.id.localeCompare(b.id, undefined, {numeric: true, sensitivity: 'base'})
        ).forEach((form) => {
          switch (form.category) {
            case 'MHL.categoryCitizenScience':
              c.push(form);
              break;
            case 'MHL.categoryBirdMonitoringSchemes':
              d.push(form);
              break;
            case 'MHL.categorySurvey':
              r.push(form);
              break;
          }
        });
        return [c, d, r];
      })
    ).subscribe(this.reducer.bind(this));
  }
}
