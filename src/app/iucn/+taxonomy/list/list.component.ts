import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of as ObservableOf, Subscription } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { DEFAULT_YEAR, FilterQuery, ResultService } from '../../iucn-shared/service/result.service';
import {TranslateService} from '@ngx-translate/core';

export type ListType = 'status'|'species'|'reasons'|'threats'|'habitat';

export interface QueryParams extends FilterQuery {
  year?: string;
  type?: ListType;
}

@Component({
  selector: 'laji-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit, OnDestroy {
  types: {label: string, value: ListType}[] = [
    {label: 'Yhteenveto uhanalaisuusluokista', value: 'status'},
    {label: 'Lajiluettelo', value: 'species'},
    {label: 'Uhanalaisuuden syyt', value: 'reasons'},
    {label: 'Uhkatekijät', value: 'threats'},
    {label: 'Elinympäristöt', value: 'habitat'}
  ];

  years$: Observable<{label: string, value: string}[]>;
  checklist: string;
  queryParams: QueryParams;
  private querySub: Subscription;

  constructor(
    public translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
    private resultService: ResultService
  ) {}

  ngOnInit() {
    this.years$ = ObservableOf(this.resultService.years.map(year => ({label: 'checklist.' + year, value: year}))).pipe(
      switchMap(options => this.translate.get(options.map(option => option.label)).pipe(
        map(translations => options.map(option => ({...option, label: translations[option.label]})))
      ))
    );
    this.querySub = this.route.queryParams.pipe(
      startWith(this.route.snapshot.queryParams),
      map(params => {
        const result = {...params};
        if (!params['type']) {
          result['type'] = this.types[0].value;
        }
        if (!params['year']) {
          result['year'] = DEFAULT_YEAR;
        }
        if (params['status'] && typeof params['status'] === 'string') {
          result['status'] = result['status'].split(',');
        }
        return result;
      })
    ).subscribe(params => {
      this.checklist = this.resultService.getChecklistVersion(params.year);
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

  queryChange(query: QueryParams, toFirstPage = true) {
    const queryParams: any = {...query};
    for (const i in queryParams) {
      if (queryParams.hasOwnProperty(i) && Array.isArray(queryParams[i])) {
        queryParams[i] = queryParams[i].join(',');
      }
    }
    if (queryParams['page'] && toFirstPage) {
      delete queryParams['page'];
    }
    this.router.navigate([], {queryParams: queryParams});
  }
}
