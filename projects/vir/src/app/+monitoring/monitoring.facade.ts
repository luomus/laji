import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FormList } from 'app/+haseka/form-list/haseka-form-list';
import { FormService } from 'app/shared/service/form.service';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

interface State {
  monitoringForms: FormList[];
}

@Injectable()
export class MonitoringFacade {
  private store$ = new BehaviorSubject<State>({
    monitoringForms: [],
  });

  monitoringForms$ = this.store$.asObservable().pipe(map(state => state.monitoringForms), distinctUntilChanged());

  constructor (private formService: FormService, private translate: TranslateService) {}

  reducer(forms) {
    this.store$.next({
      monitoringForms: forms[0]
    });
  }

  loadAll(monitoringFormIds: string[]) {
    this.formService.getAllForms(this.translate.currentLang).pipe(
      map((forms) => {
        const m = [];
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
