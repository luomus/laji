import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of as ObservableOf, Subscription } from 'rxjs';
import { delay, map, startWith, switchMap } from 'rxjs/operators';
import { DEFAULT_YEAR, FilterQuery, ResultService } from '../../iucn-shared/service/result.service';
import {TranslateService} from '@ngx-translate/core';
import { LocalizeRouterService } from '../../../../../../src/app/locale/localize-router.service';
import { Title } from '@angular/platform-browser';

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
  types: {label: string, value: ListType, labelLong?: string}[] = [
    {label: 'iucn.results.tab.status', value: 'status'},
    {label: 'iucn.results.tab.species', value: 'species'},
    {label: 'iucn.results.tab.reasons', labelLong: 'iucn.hasEndangermentReason', value: 'reasons'},
    {label: 'iucn.results.tab.threats', labelLong: 'iucn.hasThreat', value: 'threats'},
    {label: 'iucn.results.tab.habitat', value: 'habitat'}
  ];

  years$: Observable<{label: string, value: string}[]>;
  checklist: string;
  queryParams: QueryParams;
  private querySub: Subscription;
  private onlyFields = ['onlyPrimaryThreat', 'onlyPrimaryReason', 'onlyPrimaryHabitat'];
  private currentTitle = '';

  constructor(
    public translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private resultService: ResultService,
    private title: Title
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
        this.onlyFields.forEach(key => {
          result[key] = params[key] === 'true';
        });
        return result;
      }),
      delay(0) // need to delay execution a pit so that app component has enough time to set the base title
    ).subscribe(params => {
      this.checklist = this.resultService.getChecklistVersion(params.year);
      this.queryParams = params as QueryParams;
      const idx = this.types.findIndex(val => val.value === params.type);
      if (idx !== -1) {
        this.setTitle(this.translate.instant(this.types[idx].label));
      }
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
    this.onlyFields.forEach(key => {
      if (queryParams[key] === false) {
        delete queryParams[key];
      }
    });
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

  private setTitle(title: string) {
    if (this.currentTitle === title) {
      return;
    }
    this.currentTitle = title;
    this.title.setTitle(title + ' | ' + this.title.getTitle());
  }

}
