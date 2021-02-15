import { gql, QueryRef } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

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
export class BaseDataService {

  private readonly query: QueryRef<IBaseData>;
  private readonly baseDataSub = new ReplaySubject<IBaseData>(1);

  constructor(
    private graphQLService: GraphQLService,
    private translationService: TranslateService
  ) {
    this.query = this.graphQLService.watchQuery({
      query: BASE_QUERY,
      errorPolicy: 'ignore',
      fetchPolicy: 'cache-first'
    });

    this.translationService.onLangChange.pipe(
      map(() => this.baseDataSub.next(null))
    ).subscribe(() => this.query.refetch().then());

    this.query.valueChanges.pipe(
      map(({data}) => data)
    ).subscribe(data => this.baseDataSub.next(data));
  }

  getBaseData(): Observable<IBaseData> {
    return this.baseDataSub.asObservable().pipe(
      filter(data => !!data)
    );
  }
}
