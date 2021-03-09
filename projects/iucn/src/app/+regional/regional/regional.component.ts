import {Component, OnInit, ChangeDetectionStrategy, OnDestroy} from '@angular/core';
import {Observable, of as ObservableOf, Subscription} from 'rxjs';
import {map, startWith, switchMap} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {RegionalFilterQuery, RegionalService, REGIONAL_DEFAULT_YEAR} from '../../iucn-shared/service/regional.service';

export interface QueryParams extends RegionalFilterQuery {
  year?: string;
}

@Component({
  selector: 'laji-regional',
  templateUrl: './regional.component.html',
  styleUrls: ['./regional.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegionalComponent implements OnInit, OnDestroy {
  years$: Observable<{label: string, value: string}[]>;

  queryParams: QueryParams;
  private querySub: Subscription;

  constructor(
    public translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
    private resultService: RegionalService
  ) { }

  ngOnInit(): void {
    this.years$ = ObservableOf(this.resultService.years.map(year => ({label: 'iucn.regional.' + year, value: year}))).pipe(
      switchMap(options => this.translate.get(options.map(option => option.label)).pipe(
        map(translations => options.map(option => ({...option, label: translations[option.label]})))
      ))
    );

    this.querySub = this.route.queryParams.pipe(
      startWith(this.route.snapshot.queryParams),
      map(params => {
        const result = {...params};
        if (!params['year']) {
          result['year'] = REGIONAL_DEFAULT_YEAR;
        }
        if (params['status'] && typeof params['status'] === 'string') {
          result['status'] = result['status'].split(',');
        }
        return result;
      })
    ).subscribe(params => {
      this.queryParams = params as QueryParams;
    });
  }

  ngOnDestroy() {
    if (this.querySub) {
      this.querySub.unsubscribe();
    }
  }

  queryParamChange(param, value) {
    this.queryChange({...this.queryParams, [param]: value});
  }

  queryChange(query: QueryParams) {
    const queryParams: any = {...query};
    this.router.navigate([], {queryParams: queryParams});
  }
}
