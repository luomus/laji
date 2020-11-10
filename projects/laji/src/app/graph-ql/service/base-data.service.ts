import { gql, QueryRef } from 'apollo-angular';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';

import { GraphQLService } from './graph-ql.service';
import { TranslateService } from '@ngx-translate/core';

export interface IBaseData {
  classes: {
    id: string;
    label: string;
  }[];
  properties: {
    id: string;
    label: string;
  }[];
  alts: {
    id: string;
    options: {
      id: string;
      label: string;
      description: string;
      link: string;
    }[]
  }[];
  warehouseLabels: {
    enumeration: string;
    property: string;
  }[];
  information: {
    id: string;
    title: string;
    children: {
      id: string;
      title: string;
      children: {
        id: string;
        title: string;
      }[]
    }[]
  };
}

const BASE_QUERY = gql`
  query {
    classes {
      id: class
      label
    }
    properties {
      id: property
      label
    }
    alts {
      id: alt
      options {
        id
        label: value
        description
        link
      }
    }
    warehouseLabels {
      enumeration
      property
    }
    information {
      id
      title
      children {
        id
        title
        children {
          id
          title
        }
      }
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class BaseDataService implements OnDestroy {

  ref: QueryRef<IBaseData>;

  private retryFetch = false;
  private retryCnt = 0;
  private readonly langSub: Subscription;
  private readonly langChangingSub = new BehaviorSubject(false);
  private readonly langChangingObs = this.langChangingSub.asObservable();

  constructor(
    private graphQLService: GraphQLService,
    private translationService: TranslateService
  ) {
    this.ref = this.graphQLService.watchQuery({
      query: BASE_QUERY,
      errorPolicy: 'ignore',
      fetchPolicy: 'cache-first'
    });
    this.langSub = this.translationService.onLangChange.subscribe(() => {
      this.retryCnt = 0;
      this.langChangingSub.next(true);
      this.ref.refetch().then(() => {
        this.langChangingSub.next(false);
      });
    });
  }

  ngOnDestroy(): void {
    if (this.langSub) {
      this.langSub.unsubscribe();
    }
  }

  getBaseData(): Observable<IBaseData> {
    return this.ref.valueChanges.pipe(
      tap(data => data.errors ? this.retry() : null),
      switchMap(data => this.langChangingObs.pipe(
        filter(loading => !loading),
        map(() => data)
      )),
      map(({data}) => data)
    );
  }

  private retry() {
    if (this.retryCnt > 2 || this.retryFetch) {
      return;
    }
    this.retryFetch = true;
    this.retryCnt++;
    setTimeout(() => {
      this.retryFetch = false;
      this.ref.refetch();
    }, 1000);
  }
}
