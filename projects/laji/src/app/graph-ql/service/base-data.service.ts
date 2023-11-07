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
    }[];
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
      }[];
    }[];
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
  private readonly baseData$ = this.baseDataSub.asObservable();
  private readonly labelMapSub = new ReplaySubject<Record<string, string>>(1);
  private readonly labelMap$ = this.labelMapSub.asObservable();

  constructor(
    private graphQLService: GraphQLService,
    private translationService: TranslateService
  ) {
    this.query = this.graphQLService.watchQuery<IBaseData>({
      query: BASE_QUERY,
      errorPolicy: 'ignore',
      fetchPolicy: 'cache-first'
    });

    this.translationService.onLangChange.pipe(
      map(() => this.baseDataSub.next(undefined))
    ).subscribe(() => this.query.refetch().then());

    this.query.valueChanges.pipe(
      map(({data}) => data)
    ).subscribe(data => this.baseDataSub.next(data));

    this.baseData$.subscribe(data => {
      this.labelMapSub.next(this.dataToLabelMap(data));
    });
  }

  getBaseData(): Observable<IBaseData> {
    return this.baseData$.pipe(
      filter(data => !!data)
    );
  }

  getLabelMap(): Observable<Record<string, string>> {
    return this.labelMap$.pipe(
      filter(data => !!data)
    );
  }

  private dataToLabelMap(data: IBaseData): Record<string, string>|undefined {
    if (!data) {
      return undefined;
    }

    const labelMap: Record<string, string> = {};
    (data.classes || []).forEach((meta) => {
      labelMap[meta.id] = meta.label;
    });
    (data.properties || []).forEach((meta) => {
      labelMap[meta.id] = meta.label;
    });
    (data.alts || []).forEach((meta) => {
      if (meta.options) {
        meta.options.forEach((option) => {
          labelMap[option.id] = option.label;
        });
      }
    });
    return labelMap;
  }
}
