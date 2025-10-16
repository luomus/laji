/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, share, switchMap, tap } from 'rxjs/operators';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Taxon = components['schemas']['Taxon'];

@Injectable()
export class TaxonTaxonomyService {
  private cacheById: { [key: string]: { taxon?: Taxon; parentId?: string; childrenIds?: string[] } } = {};
  private pending: {[key: string]: Observable<Taxon>} = {};
  private pendingChildren: {[key: string]: Observable<Taxon[]>} = {};
  private pendingParents: {[key: string]: Observable<Taxon[]>} = {};

  constructor(
    private api: LajiApiClientBService
  ) { }

  getTaxon(id: string): Observable<Taxon> {
    if (!this.cacheById[id]) {
      this.cacheById[id] = {};
    }

    if (this.cacheById[id].taxon) {
      return of(this.cacheById[id].taxon!);
    }

    if (!this.pending[id]) {
      this.pending[id] = this.api.get('/taxa/{id}', { path: { id }, query: {
        selectedFields: this.getSelectedFields()
      } })
        .pipe(
          tap((data) => {
            this.cacheById[id].taxon = data;
          }),
          share()
        );
    }

    return this.pending[id];
  }

  getChildren(id: string): Observable<Taxon[]> {
    if (!this.cacheById[id]) {
      this.cacheById[id] = {};
    }

    if (this.cacheById[id].taxon && !this.cacheById[id].taxon!.hasChildren) {
      return of([]);
    }

    if (this.cacheById[id].childrenIds) {
      return of(
        this.cacheById[id].childrenIds!.map(childId => (this.cacheById[childId].taxon!))
      );
    }

    if (!this.pendingChildren[id]) {
      this.pendingChildren[id] = this.api.get('/taxa/{id}/children', { path: { id }, query: {
          selectedFields: this.getSelectedFields(),
          includeHidden: true,
          checklist: 'MR.1,MR.2'
        } }).pipe(
          map(({ results }) => results),
          tap(children => {
            this.cacheById[id].childrenIds = children.map(child => {
              this.cacheById[child.id] = {
                taxon: child,
                parentId: id,
                childrenIds: this.cacheById[child.id] ? this.cacheById[child.id].childrenIds : undefined
              };
              return child.id;
            });
          }),
          share()
        );
    }

    return this.pendingChildren[id];
  }

  getParents(id: string): Observable<Taxon[]> {
    if (!this.cacheById[id]) {
      this.cacheById[id] = {};
    }

    if (this.cacheById[id].taxon && !this.cacheById[id].taxon!.hasParent) {
      return of([]);
    }

    const cacheParents = this.getParentsFromCache(id);
    if (cacheParents.length > 0) {
      if (cacheParents[0].hasParent === false) {
        return of(cacheParents);
      }

      return this.getParents(cacheParents[0].id).pipe(map(parents => parents.concat(cacheParents)));
    }

    if (!this.pendingParents[id]) {

      this.pendingParents[id] = this.api.get('/taxa/{id}/parents', { path: { id }, query: {
        selectedFields: this.getSelectedFields(),
        checklist: 'MR.1,MR.2'
      } })
        .pipe(
          map(({ results }) => results),
          tap(parents => {
            let prevId = id;
            for (let i = parents.length - 1; i >= 0; i--) {
              const parent = parents[i];
              if (!this.cacheById[parent.id]) {
                this.cacheById[parent.id] = {};
              }
              this.cacheById[parent.id].taxon = parent;
              this.cacheById[prevId].parentId = parent.id;
              prevId = parent.id;
            }
          }),
          share()
        );
    }

    return this.pendingParents[id];
  }

  getParent(id: string): Observable<Taxon | undefined> {
    return this.getParents(id)
      .pipe(map(parents => parents.length > 0 ? parents[parents.length - 1] : undefined));
  }

  getSiblings(id: string): Observable<Taxon[]> {
    return this.getParent(id)
      .pipe(switchMap(parent => {
        if (!parent) {
          return this.getTaxon(id).pipe(map(taxon => [taxon]));
        }

        return this.getChildren(parent.id);
      }));
  }

  private getParentsFromCache(id: string, result: Taxon[] = []): Taxon[] {
    if (this.cacheById[id] && this.cacheById[id].parentId) {
      const parentId = this.cacheById[id].parentId!;

      if (this.cacheById[parentId].taxon) {
        result.unshift(this.cacheById[parentId].taxon!);
        return this.getParentsFromCache(parentId, result);
      }
    }

    return result;
  }

  private getSelectedFields() {
    return [
      'id',
      'hasChildren',
      'hasParent',
      'hiddenTaxon',
      'vernacularName',
      'scientificName',
      'cursiveName',
      'taxonRank',
      'finnish',
      'countOfFinnishSpecies',
      'observationCountFinland',
      'nameAccordingTo'
    ].join(',');
  }
}
