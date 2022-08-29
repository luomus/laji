import { Injectable } from '@angular/core';
import { TaxonomyApi } from '../../../../../laji/src/app/shared/api/TaxonomyApi';
import { Observable, of as ObservableOf } from 'rxjs';
import { Taxonomy } from '../../../../../laji/src/app/shared/model/Taxonomy';
import { map, share, switchMap, tap } from 'rxjs/operators';
import { RedListTaxonGroup } from '../../../../../laji/src/app/shared/model/RedListTaxonGroup';
import { RedListTaxonGroupApi } from '../../../../../laji/src/app/shared/api/RedListTaxonGroupApi';
import { Util } from '../../../../../laji/src/app/shared/service/util.service';
import { PagedResult } from 'projects/laji/src/app/shared/model/PagedResult';

@Injectable({
  providedIn: 'root'
})
export class TaxonService {

  private treeCache: {[key: string]: RedListTaxonGroup[]} = {};
  private treeRequest: {[key: string]: Observable<RedListTaxonGroup[]>} = {};

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
    if (!this.treeRequest[lang]) {
      this.treeRequest[lang] = this.redList.redListTaxonGroupsGetTree(lang).pipe(
        map(data => data.results),
        share(),
        tap(data => this.treeCache[lang] = data),
        tap(() => delete this.treeRequest[lang])
      );
    }
    return this.treeRequest[lang];
  }

  getRedListStatusQuery(
    query: any,
    lang: string,
    statusField: string,
    rootGroupIds?: string[],
    groupField = 'redListEvaluationGroups',
    scientificNameField = 'parent.family.scientificName',
    vernacularNameField = 'parent.family.vernacularName.' + lang,
  ) {
    return this.getRedListStatusTree(lang).pipe(
      map<RedListTaxonGroup[], {groups: string[]; aggregateBy: string[]; hasKeys: boolean; isRoot?: boolean}>(tree => {
        if (!query[groupField]) {
          return {
            groups: rootGroupIds ? rootGroupIds : tree.map(v => v.id),
            aggregateBy: [statusField, groupField],
            hasKeys: true,
            isRoot: true
          };
        }
        const node = this.findGroupFromTree(tree, query[groupField]);
        if (node?.hasIucnSubGroup) {
          return {
            groups: (node.hasIucnSubGroup as RedListTaxonGroup[]).map(v => v.id),
            aggregateBy: [statusField, groupField],
            hasKeys: true
          };
        }
        return {
          groups: [query[groupField]],
          aggregateBy: [statusField, scientificNameField, vernacularNameField],
          hasKeys: false
        };
      }),
      switchMap(red  => this.taxonApi.species(Util.removeFromObject({
        ...query,
        [groupField]: red.isRoot ? undefined : red.groups.join(','),
        aggregateBy: red.aggregateBy.join(',') + '=a',
        aggregateSize: 100000,
        page: 1,
        pageSize: 0
      })).pipe(
        map(data => data.aggregations ? data.aggregations['a'].reduce((cumulative: {[key: string]: any} = {}, current) => {
          const val = current.values;
          const status = val[statusField];
          const name = val[groupField] || (
            val[scientificNameField] && val[vernacularNameField] ?
              val[vernacularNameField] + ', ' + val[scientificNameField] :
              val[scientificNameField] || val[vernacularNameField]
          );
          if (current.values[groupField] && red.groups.indexOf(name) === -1) {
            return cumulative;
          }
          if (!cumulative[name]) {
            cumulative[name] = {species: name, count: 0, group: val[groupField]};
          }
          if (!cumulative[name][status]) {
            cumulative[name][status] = 0;
          }
          cumulative[name]['count'] += current.count;
          cumulative[name][status] += current.count;
          return cumulative;
        }, {}) : {}),
        map(data => Object.keys(data || {}).map(key => data[key]).sort((a, b) => b.count - a.count)),
        switchMap(data => red.hasKeys ? this.getRedListStatusLabels(lang).pipe(
          map(translations => data.map(a => ({...a, species: translations[a.species]})))
        ) : ObservableOf(data))
      )));
  }

  getSpeciesList(query: any, lang: string, pageSize = 100): Observable<PagedResult<Taxonomy>> {
    return this.taxonApi.species(query, lang, query.page || '1', '' + pageSize);
  }

  getAllSpecies(query: any, lang: string, data: Taxonomy[] = [], page = '1', pageSize = '10000'): Observable<Taxonomy[]> {
    return this.taxonApi.species(query, lang, page, pageSize).pipe(
      switchMap(result => {
        data.push(...result.results);
        if (result.lastPage && result.lastPage > result.currentPage) {
          return this.getAllSpecies(query, lang, data, '' + (result.currentPage + 1));
        } else {
          return ObservableOf(data);
        }
      })
    );
  }

  private findGroupFromTree(data: RedListTaxonGroup[], findID: string): RedListTaxonGroup|null {
    let result: RedListTaxonGroup|null = null;
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


  private getRedListStatusLabels(lang: string): Observable<{[key: string]: string}> {
    return this.getRedListStatusTree(lang).pipe(
      map(data => this.pickLabels(data))
    );
  }

  private pickLabels(data: RedListTaxonGroup[], result: {[key: string]: string} = {}) {
    data.forEach(red => {
      result[red.id] = red.name || '';
      if (red.hasIucnSubGroup) {
        this.pickLabels(red.hasIucnSubGroup as RedListTaxonGroup[], result);
      }
    });
    return result;
  }
}
