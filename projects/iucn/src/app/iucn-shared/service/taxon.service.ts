import { Injectable } from '@angular/core';
import { Observable, of as ObservableOf } from 'rxjs';
import { map, share, switchMap, tap } from 'rxjs/operators';
import { RedListTaxonGroup } from '../../../../../laji/src/app/shared/model/RedListTaxonGroup';
import { RedListTaxonGroupApi } from '../../../../../laji/src/app/shared/api/RedListTaxonGroupApi';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { components, operations, paths } from 'projects/laji-api-client-b/generated/api.d';

export type TaxonQuery = operations['TaxaController_getPageWithFilters']['parameters']['query'];
export type TaxonFilters = NonNullable<operations['TaxaController_getPageWithFilters']['requestBody']>['content']['application/json'];
export type ChecklistVersion = NonNullable<NonNullable<paths['/taxa/species/aggregate']['post']['parameters']['query']>['checklistVersion']>;

type Taxon = components['schemas']['Taxon'];

@Injectable({
  providedIn: 'root'
})
export class TaxonService {

  private treeCache: {[key: string]: RedListTaxonGroup[]} = {};
  private treeRequest: {[key: string]: Observable<RedListTaxonGroup[]>} = {};

  constructor(
    private api: LajiApiClientBService,
    private redList: RedListTaxonGroupApi
  ) { }

  getTaxon(id: string, checklistVersion?: ChecklistVersion): Observable<Taxon> {
    return this.api.get('/taxa/{id}', { path: { id }, query: {
      includeMedia: true,
      includeRedListEvaluations: true,
      checklistVersion
    }});
  }

  getTaxonSpeciesWithLatestEvaluation(id: string, checklistVersion?: ChecklistVersion): Observable<Taxon[]> {
    return this.api.post('/taxa/{id}/species', { path: { id }, query: {
      pageSize: 10000,
      checklistVersion,
      selectedFields: ['id', 'vernacularName', 'scientificName', 'cursiveName'].join(',')
    } }, {
      hasLatestRedListEvaluation: true,
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
    taxon: string | undefined,
    query: TaxonQuery,
    filters: TaxonFilters,
    lang: string,
    statusField: string,
    rootGroupIds?: string[],
  ) {
    const groupField = 'redListEvaluationGroups';
    const scientificNameField = 'parent.family.scientificName';
    const vernacularNameField = 'parent.family.vernacularName.' + lang;
    return this.getRedListStatusTree(lang).pipe(
      map<RedListTaxonGroup[], {groups: string[]; aggregateBy: string[]; hasKeys: boolean; isRoot?: boolean}>(tree => {
        if (!filters[groupField]) {
          return {
            groups: rootGroupIds ? rootGroupIds : tree.map(v => v.id),
            aggregateBy: [statusField, groupField],
            hasKeys: true,
            isRoot: true
          };
        }
        const node = this.findGroupFromTree(tree, filters[groupField][0]);
        if (node?.hasIucnSubGroup) {
          return {
            groups: (node.hasIucnSubGroup as RedListTaxonGroup[]).map(v => v.id),
            aggregateBy: [statusField, groupField],
            hasKeys: true
          };
        }
        return {
          groups: ((filters[groupField] || []) as string[]),
          aggregateBy: [statusField, scientificNameField, vernacularNameField],
          hasKeys: false
        };
      }),
      switchMap(red => {
        const _query = {
          ...query,
          aggregateBy: red.aggregateBy.join(',') + '=a',
          aggregateSize: 100000
        };
        const _filters = {
          ...filters,
          [groupField]: red.isRoot ? undefined : red.groups,
        };
        return (
          taxon
          ? this.api.post('/taxa/{id}/species/aggregate', { path: { id: taxon }, query: _query }, _filters)
          : this.api.post('/taxa/species/aggregate', { query: _query }, _filters)
        ).pipe(
          map((data: any) => data['a'].reduce((cumulative: {[key: string]: any} = {}, current: any) => {
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
          }, {})),
          map((data: any) => Object.keys(data || {}).map(key => data[key]).sort((a, b) => b.count - a.count)),
          switchMap((data: any) => red.hasKeys ? this.getRedListStatusLabels(lang).pipe(
            map(translations => data.map((a: any) => ({...a, species: translations[a.species]})))
          ) : ObservableOf(data))
        );
      }));
  }

  getSpeciesList(
    taxon: string | undefined,
    query: TaxonQuery,
    filters: TaxonFilters,
    pageSize = 100
  ) {
    query = {
      ...query,
      pageSize
    };
    return taxon
      ? this.api.post('/taxa/{id}/species', { path: { id: taxon }, query }, filters)
      : this.api.post('/taxa/species', { query }, filters);
  }

  getAllSpecies(query: TaxonQuery, filters: TaxonFilters, data: Taxon[] = [], page = 1, pageSize = 10000): Observable<Taxon[]> {
    return this.getSpeciesList(undefined, { ...query, page }, filters, pageSize).pipe(
      switchMap(result => {
        data.push(...result.results);
        if (result.lastPage && result.lastPage > result.currentPage) {
          return this.getAllSpecies(query, filters, data, result.currentPage + 1);
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
