import { Injectable } from '@angular/core';
import { forkJoin, from, map, mergeMap, of, switchMap, toArray } from 'rxjs';
import { FormService } from '../../../shared/service/form.service';
import { Observable } from 'rxjs';
import { CombineToDocument } from './import.service';
import { JSONPath } from 'jsonpath-plus';
import type { components } from 'projects/laji-api-client/generated/api';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';
import { TranslateService } from '@ngx-translate/core';
import { TriplestoreLabelService } from '../../../shared/service/triplestore-label.service';

type Form = components['schemas']['Form'];
type NamedPlace = components['schemas']['store-namedPlace'];

@Injectable({
  providedIn: 'root'
})
export class ExcelToolService {

  private openBy: {[place: string]: 'label'|'boolean'} = {
    '$.municipality': 'label',
    '$.taxonIDs[0]': 'label',
    '$.prepopulatedDocument.gatherings[0].invasiveControlOpen': 'boolean'
  };

  constructor(
    private formService: FormService,
    private api: LajiApiClientService,
    private translateService: TranslateService,
    private triplestoreLabelService: TriplestoreLabelService,
  ) {}

  getNamedPlacesList(formID: string): Observable<string[]> {
    const privatePlaces$ = this.api.get('/named-places', { query: { includePublic: false, pageSize: 100000 } })
    .pipe(map(({ results }) => results.map(namedPlace => `${namedPlace.name} (${namedPlace.id})`)));

    const formPlaces$ = (form: Form) => {
      const selected = form.options?.namedPlaceOptions?.listColumns || [];

      return this.api.get('/named-places', { query: {
        collectionID: form.collectionID,
        selectedFields: selected.map(field => field.replace('$.', '')).join(','),
        pageSize: 100000
      } }).pipe(
        switchMap(nps => from(nps.results).pipe(mergeMap(np => this.openNamedPlaceNamedPlaceKeyValues(np, selected)), toArray())),
        map(namedPlaces => namedPlaces.map(np => {
          const values = selected.reduce<string[]>((cumulative, current) => {
            const value = JSONPath({json: np, path: current, wrap: false, flatten: true});
            if (typeof value !== 'undefined') {
              cumulative.push(Array.isArray(value) ? value.join(', ') : value);
            }
            return cumulative;
          }, []);
          const last = Math.max(values.length - 1, 0);
          values[last] = values[last] + ' (' + np.id + ')';
          return values.join(' | ');
        }))
      );
    };

    return this.formService.getForm(formID).pipe(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      switchMap(form => form!.options?.useNamedPlaces ? formPlaces$(form!) : privatePlaces$),
      map(places => places.sort())
    );
  }

  getCombineOptions(form: Form): CombineToDocument[] {
    const {gatherings} = (form.schema as any)?.properties;
    if (gatherings?.items?.properties?.units?.maxItems === 1) {
      return [
        CombineToDocument.none
      ];
    } else if (gatherings?.maxItems === 1) {
      return [
        CombineToDocument.gathering,
        CombineToDocument.none
      ];
    }
    return [
      CombineToDocument.gathering,
      CombineToDocument.all,
      CombineToDocument.none
    ];
  }

  private openNamedPlaceNamedPlaceKeyValues(np: NamedPlace, keyValues: string[]): Observable<NamedPlace> {
    return from(keyValues).pipe(
      mergeMap(path => this.openBy[path] ? this.openNamedPlaceValue(np, path, this.openBy[path]) : of(np)),
      toArray(),
      map(() => np)
    );
  }

  private openNamedPlaceValue(np: NamedPlace, path: string, type: string): Observable<NamedPlace> {
    const value = JSONPath({json: np, path, wrap: false, flatten: true});
    if (typeof value === 'undefined') {
      return of(np);
    }
    return Array.isArray(value) ?
      forkJoin(value.map((val, idx) => this.openSingleNamedPlaceValue(val, np, path + '[' + idx  + ']', type))).pipe(map(() => np)) :
      this.openSingleNamedPlaceValue(value, np, path, type);
  }

  private openSingleNamedPlaceValue(value: any, np: NamedPlace, path: string, type: string): Observable<NamedPlace> {
    let convert$: Observable<string> | undefined;
    switch (type) {
      case 'boolean':
        convert$ = this.translateService.get(value === true || value === 'true' ? 'yes' : 'no');
        break;
      case 'label':
        convert$ = this.triplestoreLabelService.get(String(value));
        break;
    }
    return convert$ ? (convert$.pipe(
      map(label => {
        JSONPath({json: np, path, callback: (v: any, t: any, payload: any) => {
            try {
              payload.parent[payload.parentProperty] = label;
            } catch (e) {}
          }});
        return np;
      })
    )) : of(np);
  }

}
