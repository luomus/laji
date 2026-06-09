import { gql, QueryRef } from 'apollo-angular';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs';

import { GraphQLService } from './graph-ql.service';
import { TranslateService } from '@ngx-translate/core';

export interface IBaseData {
  classes: {
    results: {
    id: string;
    label: string;
    }[];
  };
  properties: {
    results: {
    id: string;
    label: string;
    }[];
  };
  alts: {
    results: {
      id: string;
      options: {
        id: string;
        label: string;
        description: string;
        link: string;
      }[];
    }[];
  };
  warehouseLabels: {
    results: {
      enumeration: string;
      property: string;
    }[];
  };
}

const BASE_QUERY = gql`
{
  classes: MetadataController_getClasses {
    results {
      id: class
      label
    }
  }
  properties: MetadataController_getProperties {
    results {
      id: property
      label
    }
  }
  alts: MetadataController_getAltsList {
    results {
     id
      options {
        id
        label: value
      }
    }
  }
  warehouseLabels: warehouse_enumeration_labels {
    results {
      enumeration
      property
    }
  }
}
`;

@Injectable({
  providedIn: 'root'
})
export class BaseDataService implements OnDestroy {
  private readonly query: QueryRef<IBaseData>|undefined;
  private readonly baseDataSub = new ReplaySubject<IBaseData | undefined>(1);
  private readonly baseData$ = this.baseDataSub.asObservable();
  private readonly labelMapSub = new ReplaySubject<Record<string, string> | undefined>(1);
  private readonly labelMap$ = this.labelMapSub.asObservable();
  private unsubscribe$ = new Subject<void>();

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
      takeUntil(this.unsubscribe$),
      map(() => this.baseDataSub.next(undefined))
    ).subscribe(() => this.query?.refetch().then());

    this.query?.valueChanges.pipe(
      takeUntil(this.unsubscribe$),
      map(({data}) => data)
    ).subscribe(data => this.baseDataSub.next(data as IBaseData | undefined));

    this.baseData$.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(data => {
      this.labelMapSub.next(this.dataToLabelMap(data));
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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

  private dataToLabelMap(data: IBaseData | undefined): Record<string, string>|undefined {
    if (!data) {
      return undefined;
    }

    const labelMap: Record<string, string> = {};
    (data.classes.results || []).forEach((meta) => {
      labelMap[meta.id] = meta.label;
    });
    (data.properties.results || []).forEach((meta) => {
      labelMap[meta.id] = meta.label;
    });
    (data.alts.results || []).forEach((meta) => {
      if (meta.options) {
        meta.options.forEach((option) => {
          labelMap[option.id] = option.label;
        });
      }
    });
    return labelMap;
  }
}
