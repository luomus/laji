import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FilterQuery, ResultService } from '../../iucn-shared/service/result.service';
import {TranslateService} from '@ngx-translate/core';

export type ListType = 'status'|'species'|'reasons'|'threads'|'habitat';

export interface QueryParams extends FilterQuery {
  year?: string,
  type?: ListType
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
    {label: 'Uhkatekijät', value: 'threads'},
    {label: 'Elinympäristöt', value: 'habitat'}
  ];

  years: {label: string, value: string}[];
  queryParams: QueryParams;
  private querySub: Subscription;

  constructor(
    public translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
    private resultService: ResultService
  ) {}

  ngOnInit() {
    this.years = this.resultService.years.map(year => ({label: year, value: year}));
    this.querySub = this.route.queryParams.pipe(
      startWith(this.route.snapshot.queryParams),
      map(params => {
        const result = {...params};
        ['year', 'type'].forEach(param => {
          if (!params[param]) {
            const local = param + 's';
            result[param] = this[local][0].value;
          }
        });
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
    for (const i in queryParams) {
      if (queryParams.hasOwnProperty(i) && Array.isArray(queryParams[i])) {
        queryParams[i] = queryParams[i].join(',');
      }
    }
    this.router.navigate([], {queryParams: queryParams});
  }
}
