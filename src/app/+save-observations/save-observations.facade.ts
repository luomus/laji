import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { FormList } from '../+haseka/form-list/haseka-form-list';
import { FormService } from '../shared/service/form.service';

interface State {
  citizenScienceForms: FormList[];
  birdMonitoringForms: FormList[];
  researchProjectForms: FormList[];
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

  loadAll(citizenScienceFormIds: string[], birdMonitoringFormIds: string[], researchProjectFormIds: string[]) {
    this.formService.getAllForms(this.translate.currentLang).pipe(
      map((forms) => {
        const c = [];
        const b = [];
        const r = [];
        forms.forEach((form) => {
          if (citizenScienceFormIds.includes(form.id)) {
            c.push(form);
          }
          if (birdMonitoringFormIds.includes(form.id)) {
            b.push(form);
          }
          if (researchProjectFormIds.includes(form.id)) {
            r.push(form);
          }
        });
        return [c, b, r];
      })
    ).subscribe(this.reducer.bind(this));
  }
}
