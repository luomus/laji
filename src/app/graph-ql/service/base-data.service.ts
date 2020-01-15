import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import gql from 'graphql-tag';
import { GraphQLService, QueryRef } from './graph-ql.service';

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
export class BaseDataService {

  ref: QueryRef<IBaseData>;

  constructor(
    private graphQLService: GraphQLService
  ) {
    this.ref = this.graphQLService.watchQuery({
      query: BASE_QUERY,
      errorPolicy: 'ignore',
      fetchPolicy: 'cache-first'
    });
  }

  getBaseData(): Observable<IBaseData> {
    return this.ref.valueChanges.pipe(
      map(({data}) => data),
      take(1)
    );
  }
}
