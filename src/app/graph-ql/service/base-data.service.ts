import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';

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
        label: value
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
  constructor(
    private apollo: Apollo
  ) { }

  getBaseData(): Observable<IBaseData> {
    return this.apollo.query<IBaseData>({
      query: BASE_QUERY,
      errorPolicy: 'all'
    }).pipe(
      map(({data}) => data)
    );
  }
}
