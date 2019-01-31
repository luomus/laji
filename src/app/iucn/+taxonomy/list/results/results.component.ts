import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { ListType } from '../list.component';
import { FilterQuery, ResultService } from '../../../iucn-shared/service/result.service';
import { TaxonomyApi } from '../../../../shared/api/TaxonomyApi';
import { Observable, of as ObservableOf, forkJoin as ObservableForkJoin } from 'rxjs';
import { RedListStatusData } from './red-list-status/red-list-status.component';
import { map, switchMap, tap } from 'rxjs/operators';
import { Util } from '../../../../shared/service/util.service';
import { Taxonomy } from '../../../../shared/model/Taxonomy';
import { ChartData, SimpleChartData } from './red-list-chart/red-list-chart.component';
import { TriplestoreLabelService } from '../../../../shared/service/triplestore-label.service';
import { TaxonService } from '../../../iucn-shared/service/taxon.service';
import { RedListTaxonGroup } from '../../../../shared/model/RedListTaxonGroup';
import { RedListHabitatData } from './red-list-habitat/red-list-habitat.component';
import { MetadataService } from '../../../../shared/service/metadata.service';
import { IPageChange } from '../../../../shared-modules/datatable/data-table-footer/data-table-footer.component';

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
  @Input() checklist: string;
  @Output() queryChange = new EventEmitter<FilterQuery>();

  redListStatusQuery$: Observable<RedListStatusData[]>;
  speciesQuery$: Observable<Taxonomy[]>;
  threadQuery$: Observable<ChartData[]>;
  habitatQuery$: Observable<RedListHabitatData[]>;
  habitatChartQuery$: Observable<SimpleChartData[]>;
  reasonsQuery$: Observable<ChartData[]>;

  cache: any = {};
  baseQuery = {};
  statusMap = {};

  colors = ['#d81e05', '#fc7f3f', '#f9e814', '#cce226', '#60c659', '#bfbfbf', '#777', '#000'];

  colorSchema = [];
  speciesPageSize = 1000;
  speciesPage = 1;
  speciesCount = 0;

  constructor(
    private taxonApi: TaxonomyApi,
    private resultService: ResultService,
    private triplestoreLabelService: TriplestoreLabelService,
    private metadataService: MetadataService,
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
      checklistVersion: this.checklist,
      id: this.query.taxon,
      redListEvaluationGroups: this.query.redListGroup,
      'latestRedListEvaluation.redListStatus': (this.query.status || []).map(status => this.statusMap[status] || status).join(','),
      'latestRedListEvaluation.endangermentReasons': this.query.reasons,
      'latestRedListEvaluation.primaryHabitat': this.query.habitat,
      'latestRedListEvaluation.threats': this.query.threats,
      hasLatestRedListEvaluation: true,
      includeHidden: true
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
      'latestRedListEvaluation.primaryEndangermentReason',
      'latestRedListEvaluation.endangermentReasons',
      'Ensisijainen uhka',
      'Yksi uhista',
      ['MKV.endangermentReasonMuu', 'MKV.endangermentReasonT']
    );
  }

  private initThreads() {
    this.threadQuery$ = this.getGraph(
      'threats',
      this.baseQuery,
      'latestRedListEvaluation.primaryThreat',
      'latestRedListEvaluation.threats',
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
    const primaryField = 'latestRedListEvaluation.primaryHabitat.habitat';
    const allField = 'latestRedListEvaluation.secondaryHabitats.habitat';
    const statusField = 'latestRedListStatusFinland.status';
    const query: any = {
      ...this.baseQuery,
      'latestRedListStatusFinland.status':
        (this.baseQuery as any)['latestRedListStatusFinland.status'] || this.resultService.habitatStatuses.join(','),
      aggregateBy: primaryField  + ',' + statusField + '=' + primaryField + ';' + allField + ',' + statusField + '=' + allField,
      aggregateSize: 10000
    };
    const currentQuery = JSON.stringify(query);

    this.habitatQuery$ = this.hasCache(cacheKey, currentQuery) ?
      ObservableOf(this.cache[cacheKey]) :
      this.taxonApi.species(query, this.lang, '1', '0').pipe(
        map(data => this.extractHabitat(data, primaryField, allField, statusField)),
        switchMap(data => this.metadataService.getRange('MKV.habitatEnum').pipe(
          map(label => label.reduce((cumulative, current) => {
            const idx = data.findIndex(d => d.name === current.id);
            if (idx > -1) {
              cumulative.push(data[idx]);
            }
            return cumulative;
          }, []))
        )),
        switchMap(data => this.fetchLabels(data.map(a => a.name)).pipe(
          map(translations => data.map(a => ({...a, name: translations[a.name]}))),
        )),
        map(data => !!query.primaryHabitat ? data : this.combineHabitat(data)),
        tap(data => this.setCache(cacheKey, data, currentQuery))
      );
    this.initHabitatChart();
  }

  private initHabitatChart() {
    this.colorSchema = [];
    this.habitatChartQuery$ = this.habitatQuery$.pipe(
      map(habitat => habitat.map((h, index) => {
        const color = this.colors[index % this.colors.length];
        this.colorSchema.push({name: h.name, value: color});
        return {name: h.name, value: h.primary.total};
      }))
    );
  }

  private combineHabitat(data) {
    const lookup = {};
    data.forEach(item => {
      const key = item.name.charAt(0);
      if (!lookup[key]) {
        lookup[key] = item;
        return;
      }
      const result = lookup[key];
      ['primary', 'secondary'].forEach(type => {
        Object.keys(item[type]).forEach(prop => {
          if (!result[type][prop]) {
            result[type][prop] = item[type][prop];
          } else {
            result[type][prop] += item[type][prop];
          }
        });
      });
    });

    return Object.keys(lookup).map(name => lookup[name]);
  }

  private extractHabitat(data, primaryField, allField, statusField) {
    const lookup = {};
    const count = (agg, type, field) => {
      const status = agg.values[statusField];
      const key = agg.values[field];
      if (!lookup[key]) {
        lookup[key] = {primary: {total: 0}, secondary: {total: 0}};
      }
      if (!lookup[key][type][status]) {
        lookup[key][type][status] = 0;
      }
      lookup[key].name = agg.values[field];
      lookup[key][type][status] += agg.count;
      lookup[key][type].total += agg.count;
    };
    data.aggregations[primaryField].forEach(agg => count(agg, 'primary', primaryField));
    data.aggregations[allField].forEach(agg => count(agg, 'secondary', allField));
    return Object.keys(lookup).map(name => lookup[name]);
  }

  private initSpeciesListQuery() {
    const cacheKey = 'species';
    const selectedFields = [
      'id',
      'scientificName',
      'vernacularName.' + this.lang,
      'cursiveName',
      'latestRedListEvaluation.redListStatus',
      'latestRedListEvaluation.endangermentReasons',
      'latestRedListEvaluation.redListStatusNotes',
      'latestRedListEvaluation.reasonForStatusChange',
      'latestRedListEvaluation.primaryHabitat.habitat',
      'latestRedListEvaluation.secondaryHabitats.habitat',
      'latestRedListEvaluation.threats',
      'redListEvaluation.*.redListStatus'
    ];
    const query = {
      ...this.baseQuery,
      page: this.query.page || '1',
      selectedFields: selectedFields.join(',')
    };

    const currentQuery = JSON.stringify(query);
    this.speciesQuery$ = this.hasCache(cacheKey, currentQuery) ?
      ObservableOf(this.cache[cacheKey]) :
      this.taxonApi.species(query, this.lang, this.query.page || '1', '' + this.speciesPageSize).pipe(
        tap(data => {
          this.speciesPage = data.currentPage;
          this.speciesCount = data.total;
        }),
        map(data => data.results),
        tap(data => this.setCache(cacheKey, data, currentQuery))
      );
  }

  private initStatusQuery() {
    const cacheKey = 'status';
    const statusField = 'latestRedListEvaluation.redListStatus';
    const groupField = 'redListEvaluationGroups';

    const scientificNameField = 'parent.family.scientificName';
    const vernacularNameField = 'parent.family.vernacularName.' + this.lang;

    const query: any = {
      ...this.removeKeys(this.baseQuery, [statusField])
    };

    const currentQuery = JSON.stringify(query);
    this.redListStatusQuery$ = this.hasCache(cacheKey, currentQuery) ?
      ObservableOf(this.cache[cacheKey]) :
      this.taxonService.getRedListStatusTree(this.lang).pipe(
        map<RedListTaxonGroup[], {groups: string[], aggregateBy: string[], hasKeys: boolean, isRoot?: boolean}>(tree => {
          if (!query[groupField]) {
            return {
              groups: tree.map(v => v.id),
              aggregateBy: [statusField, groupField],
              hasKeys: true,
              isRoot: true
            };
          }
          const node = this.taxonService.findGroupFromTree(tree, query[groupField]);
          if (node.hasIucnSubGroup) {
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
        switchMap(red  => this.taxonApi.species(Util.removeUndefinedFromObject({
          ...query,
          [groupField]: red.isRoot ? undefined : red.groups.join(','),
          aggregateBy: red.aggregateBy.join(',') + '=a',
          aggregateSize: 100000,
          page: 1,
          pageSize: 0
        })).pipe(
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

  changeSpeciesPage(event: IPageChange) {
    this.queryChange.emit({
      ...this.query,
      page: '' + event.page
    });
  }
}
