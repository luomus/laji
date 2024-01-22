import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { FormService } from '../shared/service/form.service';
import { Form } from '../shared/model/Form';
import { Global } from '../../environments/global';

interface State {
  citizenScienceForms: Form.List[];
  birdMonitoringForms: Form.List[];
  completeListForms: Form.List[];
  researchProjectForms: Form.List[];
}

@Injectable()
export class SaveObservationsFacade {
  private store$ = new BehaviorSubject<State>({
    citizenScienceForms: [],
    birdMonitoringForms: [],
    completeListForms: [],
    researchProjectForms: []
  });

  citizenScienceForms$ = this.store$.asObservable().pipe(map(state => state.citizenScienceForms), distinctUntilChanged());
  birdMonitoringForms$ = this.store$.asObservable().pipe(map(state => state.birdMonitoringForms), distinctUntilChanged());
  completeListForms$ = this.store$.asObservable().pipe(map(state => state.completeListForms), distinctUntilChanged());
  researchProjectForms$ = this.store$.asObservable().pipe(map(state => state.researchProjectForms), distinctUntilChanged());

  constructor(private formService: FormService) {}

  reducer(forms) {
    this.store$.next({
      citizenScienceForms: forms[0],
      birdMonitoringForms: forms[1],
      completeListForms: forms[2],
      researchProjectForms: forms[3]
    });
  }

  loadAll() {
    this.formService.getAllForms().pipe(
      map((forms) => {
        const citizen = [];
        const birdMon = [];
        const complete = [];
        const surveys = [];

        forms.sort((a, b) =>
          a.id.localeCompare(b.id, undefined, {numeric: true, sensitivity: 'base'})
        ).forEach((form) => {
          switch (form.category) {
            case 'MHL.categoryCitizenScience':
              citizen.push(form);
              break;
            case 'MHL.categoryBirdMonitoringSchemes':
              birdMon.push(form);
              break;
            case 'MHL.categoryBiomonCompleteLists':
              complete.push(form);
              break;
            case 'MHL.categorySurvey':
              surveys.push(form);
              break;
          }
        });

        return [citizen, birdMon, complete, surveys].map(_forms =>
          !_forms.length || !Global.formCategoryOrder[_forms[0].category]
            ? _forms
            : _forms.sort((a, b) => {
              const order = Global.formCategoryOrder[a.category];
              if (!order) {
                return 0;
              }
              const [aIndex, bIndex] = [a,b].map(f => order.indexOf(f.id));
              if ([aIndex, bIndex].every(i => i !== -1)) {
                return aIndex - bIndex;
              } else if (aIndex !== -1) {
                return -1;
              } else if (bIndex !== -1) {
                return 1;
              } else {
                return 0;
              }
            }));
      })
    ).subscribe(this.reducer.bind(this));
  }
}
