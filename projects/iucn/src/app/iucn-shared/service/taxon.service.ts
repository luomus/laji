import { Injectable } from '@angular/core';
import { TaxonomyApi } from '../../../../../laji/src/app/shared/api/TaxonomyApi';
import { Observable, of as ObservableOf } from 'rxjs';
import { Taxonomy } from '../../../../../laji/src/app/shared/model/Taxonomy';
import { map, share, tap } from 'rxjs/operators';
import { RedListTaxonGroup } from '../../../../../laji/src/app/shared/model/RedListTaxonGroup';
import { RedListTaxonGroupApi } from '../../../../../laji/src/app/shared/api/RedListTaxonGroupApi';

@Injectable({
  providedIn: 'root'
})
export class TaxonService {

  private treeCache = {};
  private request = {};

  constructor(
    private taxonApi: TaxonomyApi,
    private redList: RedListTaxonGroupApi
  ) { }

  getTaxon(id: string, lang: string, checklist?: string): Observable<Taxonomy> {
    return this.taxonApi.taxonomyFindBySubject(id, lang, {
      includeMedia: true,
      includeRedListEvaluations: true,
      checklistVersion: checklist
    });
  }

  getTaxonSpeciesWithLatestEvaluation(id: string, lang: string, checklist?: string): Observable<Taxonomy[]> {
    return this.taxonApi.taxonomyFindSpecies(
      id,
      lang, undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      '1',
      '10000',
      undefined,
      {
        hasLatestRedListEvaluation: true,
        checklistVersion: checklist,
        selected: ['id', 'vernacularName', 'scientificName', 'cursiveName']
      }).pipe(
        map(res => res.results)
    );
  }

  getRedListStatusTree(lang: string): Observable<RedListTaxonGroup[]> {
    if (this.treeCache[lang]) {
      return ObservableOf(this.treeCache[lang]);
    }
    if (!this.request[lang]) {
      this.request[lang] = this.redList.redListTaxonGroupsGetTree(lang).pipe(
        map(data => data.results),
        share(),
        tap(data => this.treeCache[lang] = data),
        tap(() => delete this.request[lang])
      );
    }
    return this.request[lang];
  }

  getRedListStatusLabels(lang: string): Observable<{[key: string]: string}> {
    return this.getRedListStatusTree(lang).pipe(
      map(data => this.pickLabels(data))
    );
  }

  findGroupFromTree(data: RedListTaxonGroup[], findID: string): RedListTaxonGroup|null {
    let result = null;
    data.forEach(red => {
      if (result !== null) {
        return;
      }
      if (red.id === findID) {
        result = red;
        return;
      }
      if (red.hasIucnSubGroup) {
        result = this.findGroupFromTree(red.hasIucnSubGroup as RedListTaxonGroup[], findID);
      }
    });

    return result;
  }

  private pickLabels(data: RedListTaxonGroup[], result = {}) {
    data.forEach(red => {
      result[red.id] = red.name;
      if (red.hasIucnSubGroup) {
        this.pickLabels(red.hasIucnSubGroup as RedListTaxonGroup[], result);
      }
    });
    return result;
  }
}
