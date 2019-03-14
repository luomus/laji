import { Injectable } from '@angular/core';
import { Taxonomy } from '../../../shared/model/Taxonomy';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { Observable, of } from 'rxjs';
import { tap, share, map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class TaxonTaxonomyService {
  private cacheById: { [key: string]: { taxon?: Taxonomy, parentId?: string, childrenIds?: string[] } } = {};
  private pending: {[key: string]: Observable<Taxonomy>} = {};
  private pendingChildren: {[key: string]: Observable<Taxonomy[]>} = {};
  private pendingParents: {[key: string]: Observable<Taxonomy[]>} = {};

  constructor(
    private translate: TranslateService,
    private taxonService: TaxonomyApi
  ) { }

  getTaxon(id: string): Observable<Taxonomy> {
    if (!this.cacheById[id]) {
      this.cacheById[id] = {};
    }

    if (this.cacheById[id].taxon) {
      return of(this.cacheById[id].taxon);
    }

    if (!this.pending[id]) {
      this.pending[id] = this.taxonService
        .taxonomyFindBySubject(id, this.translate.currentLang, {
          selectedFields: this.getSelectedFields(),
          onlyFinnish: false
        })
        .pipe(
          tap((data) => {
            this.cacheById[id].taxon = data;
          }),
          share()
        );
    }

    return this.pending[id];
  }

  getChildren(id: string): Observable<Taxonomy[]> {
    if (!this.cacheById[id]) {
      this.cacheById[id] = {};
    }

    if (this.cacheById[id].taxon && !this.cacheById[id].taxon.hasChildren) {
      return of([]);
    }

    if (this.cacheById[id].childrenIds) {
      return of(
        this.cacheById[id].childrenIds.map(childId => (this.cacheById[childId].taxon))
      );
    }

    if (!this.pendingChildren[id]) {
      this.pendingChildren[id] = this.taxonService
        .taxonomyFindChildren(id, this.translate.currentLang, undefined, {
          selectedFields: this.getSelectedFields(),
          onlyFinnish: false
        })
        .pipe(
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

  getParents(id: string): Observable<Taxonomy[]> {
    if (!this.cacheById[id]) {
      this.cacheById[id] = {};
    }

    if (this.cacheById[id].taxon && !this.cacheById[id].taxon.hasParent) {
      return of([]);
    }

    const cacheParents = this.getParentsFromCache(id);
    if (cacheParents.length > 0) {
      if (cacheParents[0].hasParent === false) {
        return of(cacheParents);
      }

      return this.getParents(cacheParents[0].id).pipe(map(parents => {
        return parents.concat(cacheParents);
      }));
    }

    if (!this.pendingParents[id]) {
      this.pendingParents[id] = this.taxonService
        .taxonomyFindParents(id, this.translate.currentLang, {
          selectedFields: this.getSelectedFields(),
          onlyFinnish: false
        })
        .pipe(
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

  getParent(id: string): Observable<Taxonomy> {
    return this.getParents(id)
      .pipe(map(parents => parents.length > 0 ? parents[parents.length - 1] : undefined));
  }

  private getParentsFromCache(id: string, result: Taxonomy[] = []): Taxonomy[] {
    if (this.cacheById[id] && this.cacheById[id].parentId) {
      const parentId = this.cacheById[id].parentId;

      if (this.cacheById[parentId].taxon) {
        result.unshift(this.cacheById[parentId].taxon);
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
      'vernacularName',
      'scientificName',
      'cursiveName',
      'taxonRank',
      'countOfFinnishSpecies'
    ].join(',');
  }
}
