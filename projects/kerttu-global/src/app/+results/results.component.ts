import { Component } from '@angular/core';
import { IGlobalSpeciesFilters, IGlobalSpeciesQuery, IUserStat, IValidationStat } from '../kerttu-global-shared/models';
import { KerttuGlobalApi } from '../kerttu-global-shared/service/kerttu-global-api';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, startWith } from 'rxjs/operators';
import { UserService } from 'projects/laji/src/app/shared/service/user.service';

@Component({
  selector: 'laji-about',
  template: `
    <div class="container">
      <h1>{{ 'results.title' | translate }}</h1>
      <laji-species-list-filters
        [query]="speciesQuery$ | async"
        [filters]="speciesFilters$ | async"
        [showOnlyUnvalidated]="false"
        (queryChange)="onSpeciesQueryChange($event)"
      ></laji-species-list-filters>
      <h2>{{ 'results.pie.title' | translate }}</h2>
      <laji-validation-pie-chart
        [data]="validationStats$ | async"
      ></laji-validation-pie-chart>
      <h2>{{ 'results.userTable.title' | translate }}</h2>
      <laji-user-table
        [userId]="userId$ | async"
        [data]="userStats$ | async"
      ></laji-user-table>
    </div>
  `
})
export class ResultsComponent {
  speciesFilters$: Observable<IGlobalSpeciesFilters>;
  validationStats$: Observable<IValidationStat[]>;
  userStats$: Observable<IUserStat[]>;
  userId$: Observable<string>;

  private speciesQuerySubject = new BehaviorSubject<IGlobalSpeciesQuery>({});
  speciesQuery$ = this.speciesQuerySubject.asObservable();

  constructor(
    private kerttuGlobalApi: KerttuGlobalApi,
    private userService: UserService
  ) {
    this.speciesFilters$ = this.kerttuGlobalApi.getSpeciesFilters();
    this.validationStats$ = this.speciesQuery$.pipe(
      switchMap(speciesQuery => {
        return this.kerttuGlobalApi.getValidationStats(speciesQuery).pipe(
          map(result => result.results),
          startWith(null)
        );
      })
    );
    this.userStats$ = this.speciesQuery$.pipe(
      switchMap(speciesQuery => {
        return this.kerttuGlobalApi.getUserStats(speciesQuery).pipe(
          map(result => result.results),
          startWith(null)
        );
      })
    );
    this.userId$ = this.userService.user$.pipe(map(user => user?.id));
  }

  onSpeciesQueryChange(query: IGlobalSpeciesQuery) {
    this.speciesQuerySubject.next(query);
  }
}
