import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { ListType } from '../list.component';
import { FilterQuery, ResultService } from '../../../iucn-shared/service/result.service';
import { TaxonomyApi } from '../../../../shared/api/TaxonomyApi';
import { Observable, of as ObservableOf, forkJoin as ObservableForkJoin } from 'rxjs';
import { RedListStatusData } from './red-list-status/red-list-status.component';
import { map, switchMap, tap } from 'rxjs/operators';
import { Util } from '../../../../shared/service/util.service';
import { Taxonomy } from '../../../../shared/model/Taxonomy';
import { ChartData } from './red-list-chart/red-list-chart.component';
import { TriplestoreLabelService } from '../../../../shared/service/triplestore-label.service';
import { TaxonService } from '../../../iucn-shared/service/taxon.service';
import { RedListTaxonGroup } from '../../../../shared/model/RedListTaxonGroup';

@Component({
  selector: 'laji-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultsComponent implements OnChanges {

  @Input() type: ListType;
  @Input() query: FilterQuery;
  @Input() lang: string;
  @Input() year: string;

  redListStatusQuery$: Observable<RedListStatusData[]>;
  speciesQuery$: Observable<Taxonomy[]>;
  threadQuery$: Observable<ChartData[]>;
  habitatQuery$: Observable<ChartData[]>;
  reasonsQuery$: Observable<ChartData[]>;

  cache: any = {};
  baseQuery = {};
  statusMap = {};

  constructor(
    private taxonApi: TaxonomyApi,
    private resultService: ResultService,
    private triplestoreLabelService: TriplestoreLabelService,
    private taxonService: TaxonService
  ) {
    this.statusMap = Object.keys(this.resultService.shortLabel).reduce((result, key) => {
      result[this.resultService.shortLabel[key]] = key;
      return result;
    }, {});
  }

  ngOnChanges() {
    this.initQueries();
  }

  private initQueries() {
    this.baseQuery = Util.removeUndefinedFromObject({
      checklistVersion: this.resultService.getChecklistVersion(this.year),
      redListTaxonGroup: this.query.redListGroup,
      redListStatusFilters: (this.query.status || []).map(status => this.statusMap[status] || status).join(',')
    });
    this.initStatusQuery();
    this.initSpeciesListQuery();
    this.initThreads();
    this.initHabitat();
    this.initReasons();
  }

  private initReasons() {
    this.reasonsQuery$ = this.getGraph(
      'reasons',
      this.baseQuery,
      'redListEvaluation.2019.primaryEndangermentReason',
      'redListEvaluation.2019.endangermentReasons',
      'Ensisijainen uhka',
      'Yksi uhista',
      ['MKV.endangermentReasonMuu', 'MKV.endangermentReasonT']
    );
  }

  private initThreads() {
    this.threadQuery$ = this.getGraph(
      'threads',
      this.baseQuery,
      'redListEvaluation.2019.primaryThreat',
      'redListEvaluation.2019.threats',
      'Ensisijainen uhka',
      'Yksi uhista',
      ['MKV.endangermentReasonMuu', 'MKV.endangermentReasonT']
    );
  }

  private getGraph(cacheKey, baseQuery, primaryField, allField, primaryLabel, allLabel, lastKeys: string[] = []): Observable<ChartData[]> {
    const query = {
      ...baseQuery,
      aggregateBy: primaryField + ';' + allField,
      aggregateSize: 10000
    };
    const currentQuery = JSON.stringify(query);

    return this.hasCache(cacheKey, currentQuery) ?
      ObservableOf(this.cache[cacheKey]) :
      this.taxonApi.species(query, this.lang, '1', '0').pipe(
        map(data => {
          const lookup = {};
          const result = [];
          const last = {};

          data.aggregations[primaryField].forEach(agg => {
            lookup[agg.values[primaryField]] = {
              name: agg.values[primaryField],
              series: [{name: primaryLabel, value: agg.count}]
            };
            if (lastKeys.indexOf(agg.values[primaryField]) > -1) {
              last[agg.values[primaryField]] = lookup[agg.values[primaryField]];
            } else {
              result.push(lookup[agg.values[primaryField]]);
            }
          });
          data.aggregations[allField].forEach(agg => {
            const value = agg.values[allField];
            if (lookup[value]) {
              lookup[value].series.push({name: allLabel, value: agg.count});
            } else {
              const obj = {
                name: agg.values[allField],
                series: [{name: primaryLabel, value: 0}, {name: allLabel, value: agg.count}]
              };
              if (lastKeys.indexOf(value) > -1) {
                last[value] = obj;
              } else {
                result.push(obj);
              }
            }
          });
          lastKeys.forEach(key => {
            if (last[key]) {
              result.push(last[key]);
            }
          });

          return result;
        }),
        switchMap(data => this.fetchLabels(data.map(a => a.name)).pipe(
          map(translations => data.map(a => ({...a, name: translations[a.name]})))
        )),
        tap(data => this.setCache(cacheKey, data, currentQuery))
      );
  }

  private initHabitat() {
    const cacheKey = 'habitat';
    const primaryField = 'redListEvaluation.2019.primaryHabitat.habitat';
    const allField = 'redListEvaluation.2019.secondaryHabitats.habitat';
    const statusField = 'latestRedListStatusFinland.status';
    const query = {
      ...this.baseQuery,
      redListStatusFilters: this.resultService.habitatStatuses.join(','),
      aggregateBy: primaryField  + ',' + statusField + '=' + primaryField + ';' + allField + ',' + statusField + '=' + allField,
      aggregateSize: 10000
    };
    const currentQuery = JSON.stringify(query);

    this.habitatQuery$ = this.hasCache(cacheKey, currentQuery) ?
      ObservableOf(this.cache[cacheKey]) :
      this.taxonApi.species(query, this.lang, '1', '0').pipe(
        map(data => {
          const lookup = {};

          data.aggregations[primaryField].forEach(agg => {
            if (!lookup[agg.values[primaryField]]) {
              lookup[agg.values[primaryField]] = {primary: {total: 0}, secondary: {total: 0}};
            }
            lookup[agg.values[primaryField]].primary[agg.values[statusField]] = agg.count;
            lookup[agg.values[primaryField]].primary.total += agg.count;
          });
          data.aggregations[allField].forEach(agg => {
            if (!lookup[agg.values[allField]]) {
              lookup[agg.values[allField]] = {primary: {total: 0}, secondary: {total: 0}};
            }
            if (!lookup[agg.values[allField]].secondary[agg.values[statusField]]) {
              lookup[agg.values[allField]].secondary[agg.values[statusField]] = 0;
            }
            lookup[agg.values[allField]].secondary[agg.values[statusField]] += agg.count;
            lookup[agg.values[allField]].secondary.total += agg.count;
          });
          return Object.keys(lookup).map(name => ({...lookup[name], name: name}));
        }),
        switchMap(data => this.fetchLabels(data.map(a => a.name)).pipe(
          map(translations => data.map(a => ({...a, name: translations[a.name]}))),
        )),
        map(data => data.sort((a, b) => {
          const aIsAlphabetical = a.name.localeCompare('a') >= 0,
            bIsAlphabetical = b.name.localeCompare('a') >= 0;
          if (!aIsAlphabetical && bIsAlphabetical) {
            return 1;
          }
          if (aIsAlphabetical && !bIsAlphabetical) {
            return -1;
          }
          return a.name.localeCompare(b.name);
        })),
        tap(data => this.setCache(cacheKey, data, currentQuery))
      );
  }

  private initSpeciesListQuery() {
    const cacheKey = 'species';
    const selectedFields = [
      'id',
      'scientificName',
      'vernacularName.' + this.lang,
      'cursiveName',
      'latestRedListStatusFinland.*',
      'redListEvaluation.*.endangermentReasons',
      'redListEvaluation.*.redListStatusNotes',
      'redListEvaluation.*.reasonForStatusChange',
      'redListEvaluation.*.primaryHabitat.habitat',
      'redListEvaluation.*.secondaryHabitats.habitat',
      'redListEvaluation.*.threats',
    ];
    const query = {
      ...this.baseQuery,
      selectedFields: selectedFields.join(',')
    };

    const currentQuery = JSON.stringify(query);
    this.speciesQuery$ = this.hasCache(cacheKey, currentQuery) ?
      ObservableOf(this.cache[cacheKey]) :
      this.taxonApi.species(query, this.lang, '1', '1000').pipe(
        map(data => data.results),
        tap(data => this.setCache(cacheKey, data, currentQuery))
      );
  }

  private initStatusQuery() {
    const cacheKey = 'status';
    const statusField = 'latestRedListStatusFinland.status';
    const groupField = 'iucnRedListTaxonGroups';

    const scientificNameField = 'parent.family.scientificName';
    const vernacularNameField = 'parent.family.vernacularName.' + this.lang;

    const query: any = {
      ...this.removeKeys(this.baseQuery, ['redListStatusFilters'])
    };

    const currentQuery = JSON.stringify(query);
    if (this.hasCache(cacheKey, currentQuery)) {
      this.redListStatusQuery$ = ObservableOf(this.cache[cacheKey]);
      return;
    }

    this.redListStatusQuery$ = this.hasCache(cacheKey, currentQuery) ?
      ObservableOf(this.cache[cacheKey]) :
      this.taxonService.getRedListStatusTree(this.lang).pipe(
        map(tree => {
          if (!query.redListTaxonGroup) {
            return {
              groups: tree.map(v => v.id),
              aggregateBy: [statusField, groupField],
              hasKeys: true
            };
          }
          const node = this.taxonService.findGroupFromTree(tree, query.redListTaxonGroup);
          if (node.hasIucnSubGroup) {
            return {
              groups: (node.hasIucnSubGroup as RedListTaxonGroup[]).map(v => v.id),
              aggregateBy: [statusField, groupField],
              hasKeys: true
            };
          }
          return {
            groups: [query.redListTaxonGroup],
            aggregateBy: [statusField, scientificNameField, vernacularNameField],
            hasKeys: false
          };
        }),
        switchMap(red  => this.taxonApi.species({
          ...query,
          redListTaxonGroup: red.groups.join(','),
          aggregateBy: red.aggregateBy.join(',') + '=a',
          aggregateSize: 100000,
          page: 1,
          pageSize: 0
        }).pipe(
          map(data => data.aggregations['a'].reduce((cumulative: {}, current) => {
            const val = current.values;
            const status = val[statusField];
            const name = val[groupField] || (
              val[scientificNameField] && val[vernacularNameField] ?
                val[scientificNameField] + ', ' + val[vernacularNameField] :
                val[scientificNameField] || val[vernacularNameField]
            );
            if (current.values[groupField] && red.groups.indexOf(name) === -1) {
              return cumulative;
            }
            if (!cumulative[name]) {
              cumulative[name] = {species: name, count: 0};
            }
            if (!cumulative[name][status]) {
              cumulative[name][status] = 0;
            }
            cumulative[name]['count'] += current.count;
            cumulative[name][status] += current.count;
            return cumulative;
          }, {})),
          map(data => Object.keys(data).map(key => data[key]).sort((a, b) => b.count - a.count)),
          switchMap(data => red.hasKeys ? this.taxonService.getRedListStatusLabels(this.lang).pipe(
            map(translations => data.map(a => ({...a, species: translations[a.species]})))
          ) : ObservableOf(data))
        )),
        tap(data => this.setCache(cacheKey, data, currentQuery))
      );
  }

  private fetchLabels(keys: string[]): Observable<{[key: string]: string}> {
    const obs = keys.map(key => this.triplestoreLabelService.get(key, this.lang).pipe(map(val => ({
        key: key,
        label: val
      }))));
    return ObservableForkJoin(obs).pipe(
      map(data => data.reduce((cumulative, current) => {
        cumulative[current.key] = current.label;
        return cumulative;
      }, {}))
    );
  }

  private removeKeys(obj: object, keys: string[]) {
    const result = {};
    Object.keys(obj).forEach(key => {
      if (keys.indexOf(key) === -1) {
        result[key] = obj[key];
      }
    });
    return result;
  }

  private setCache(key: string, data: any, query: string) {
    this.cache[key] = data;
    this.cache[key + '_query'] = query;
  }

  private hasCache(key: string, query: string) {
    return !!(this.cache[key + '_query'] && this.cache[key + '_query'] === query);
  }

}
