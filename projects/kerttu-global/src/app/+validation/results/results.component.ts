import { Component } from '@angular/core';
import { IGlobalSpeciesFilters, IGlobalSpeciesQuery, IUserStat, IValidationStat } from '../../kerttu-global-shared/models';
import { KerttuGlobalApi } from '../../kerttu-global-shared/service/kerttu-global-api';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, startWith } from 'rxjs/operators';
import { UserService } from 'projects/laji/src/app/shared/service/user.service';

@Component({
  selector: 'bsg-results',
  template: `
    <div class="container laji-page">
      <h1>{{ 'results.title' | translate }}</h1>
      <bsg-species-list-filters
        [query]="speciesQuery$ | async"
        [filters]="speciesFilters$ | async"
        [showOnlyUnvalidated]="false"
        [showSearch]="false"
        (queryChange)="onSpeciesQueryChange($event)"
      ></bsg-species-list-filters>
      <h2>{{ 'results.pie.title' | translate }}</h2>
      <bsg-validation-pie-chart
        [data]="validationStats$ | async"
      ></bsg-validation-pie-chart>
      <h2>{{ 'results.userTable.title' | translate }}</h2>
      <bsg-user-table
        [userId]="userId$ | async"
        [data]="userStats$ | async"
      ></bsg-user-table>
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
          startWith(<IValidationStat[]>null)
        );
      })
    );
    this.userStats$ = this.speciesQuery$.pipe(
      switchMap(speciesQuery => {
        return this.kerttuGlobalApi.getUserStats(speciesQuery).pipe(
          map(result => result.results),
          startWith(<IUserStat[]>null)
        );
      })
    );
    this.userId$ = this.userService.user$.pipe(map(user => user?.id));
  }

  onSpeciesQueryChange(query: IGlobalSpeciesQuery) {
    this.speciesQuerySubject.next(query);
  }
}
