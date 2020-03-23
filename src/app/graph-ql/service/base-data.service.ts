import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription, throwError } from 'rxjs';
import { concat, delay, filter, map, retryWhen, switchMap, take } from 'rxjs/operators';
import gql from 'graphql-tag';
import { GraphQLService, QueryRef } from './graph-ql.service';
import { TranslateService } from '@ngx-translate/core';
import { throwError as observableThrowError } from 'rxjs/internal/observable/throwError';

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
      id: class,
      label
    }
    properties {
      id: property,
      label
    }
    alts {
      id: alt
      options {
        id
        label: value,
        description,
        link
      }
    }
    information {
      id,
      title,
      children {
        id,
        title,
        children {
          id,
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
      switchMap(data => data.errors ? throwError('Errors could not fetch all base data') : of(data.data)),
      retryWhen(errors => errors.pipe(delay(1000), take(2), concat(observableThrowError(errors)))),
      switchMap(data => this.langChangingObs.pipe(
        filter(loading => !loading),
        map(() => data)
      ))
    );
  }
}
