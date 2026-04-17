import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs';
import { FormService } from '../../../../laji/src/app/shared/service/form.service';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type FormListing = components['schemas']['FormListing'];

interface State {
  monitoringForms: FormListing[];
}

@Injectable()
export class MonitoringFacade {
  private store$ = new BehaviorSubject<State>({
    monitoringForms: [],
  });

  monitoringForms$ = this.store$.asObservable().pipe(map(state => state.monitoringForms), distinctUntilChanged());

  constructor(private formService: FormService) {}

  reducer(forms: FormListing[][]) {
    this.store$.next({
      monitoringForms: forms[0]
    });
  }

  loadAll(monitoringFormIds: string[]) {
    this.formService.getAllForms().pipe(
      map((forms) => {
        const m: FormListing[] = [];
        forms.forEach((form) => {
          if (monitoringFormIds.includes(form.id)) {
            m.push(form);
          }
        });
        return [m];
      })
    ).subscribe(this.reducer.bind(this));
  }
}
