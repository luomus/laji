import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit } from '@angular/core';
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
    private triplestoreLabelService: TriplestoreLabelService
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

  private initHabitat() {
    const cacheKey = 'habitat';
    const habitatField = 'redListEvaluation.2019.primaryHabitat.habitat';
    const query = {
      ...this.baseQuery,
      aggregateBy: habitatField
    };

    const currentQuery = JSON.stringify(query);
    this.habitatQuery$ = this.hasCache(cacheKey, currentQuery) ?
      ObservableOf(this.cache[cacheKey]) :
      this.taxonApi.species(query, this.lang, '1', '0').pipe(
      map(data => data.aggregations[habitatField].map(agg => ({
        name: agg.values[habitatField],
        series: [{name: '', value: agg.count}]
      }))),
      switchMap(data => this.fetchLabels(data.map(a => a.name)).pipe(
        map(translations => {
          return data.map(a => ({...a, name: translations[a.name]}));
        })
      )),
      tap(data => this.setCache(cacheKey, data, currentQuery))
    );
  }

  private initReasons() {
    const cacheKey = 'reasons';
    const field = 'redListEvaluation.2019.endangermentReasons';
    const query = {
      ...this.baseQuery,
      aggregateBy: field
    };

    const currentQuery = JSON.stringify(query);
    this.reasonsQuery$ = this.hasCache(cacheKey, currentQuery) ?
      ObservableOf(this.cache[cacheKey]) :
      this.taxonApi.species(query, this.lang, '1', '0').pipe(
        map(data => data.aggregations[field].map(agg => ({
          name: agg.values[field],
          series: [{name: '', value: agg.count}]
        }))),
        switchMap(data => this.fetchLabels(data.map(a => a.name)).pipe(
          map(translations => {
            return data.map(a => ({...a, name: translations[a.name]}));
          })
        )),
        tap(data => this.setCache(cacheKey, data, currentQuery))
      );
  }

  private initThreads() {
    const cacheKey = 'threads';
    const threadField = 'redListEvaluation.2019.threats';
    const query = {
      ...this.baseQuery,
      aggregateBy: threadField
    };

    const currentQuery = JSON.stringify(query);
    this.threadQuery$ = this.hasCache(cacheKey, currentQuery) ?
      ObservableOf(this.cache[cacheKey]) :
      this.taxonApi.species(query, this.lang, '1', '0').pipe(
      map(data => data.aggregations[threadField].map(agg => ({
        name: agg.values[threadField],
        series: [{name: '', value: agg.count}]
      }))),
      switchMap(data => this.fetchLabels(data.map(a => a.name)).pipe(
        map(translations => {
          return data.map(a => ({...a, name: translations[a.name]}));
        })
      )),
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
    const scientificNameField = 'parent.family.scientificName';
    const vernacularNameField = 'parent.family.vernacularName.' + this.lang;
    const aggregateBy = [statusField, scientificNameField, vernacularNameField].join(',');

    const query = {
      ...this.removeKeys(this.baseQuery, ['redListStatusFilters']),
      aggregateBy: aggregateBy
    };

    const currentQuery = JSON.stringify(query);
    if (this.hasCache(cacheKey, currentQuery)) {
      this.redListStatusQuery$ = ObservableOf(this.cache[cacheKey]);
      return;
    }

    this.redListStatusQuery$ = this.hasCache(cacheKey, currentQuery) ?
      ObservableOf(this.cache[cacheKey]) :
      this.taxonApi.species({
        ...query,
        aggregateSize: 10000,
        page: 1,
        pageSize: 0
      }).pipe(
        map(data => data.aggregations[aggregateBy].reduce((cumulative: {}, current) => {
          const status = current.values[statusField];
          const name = current.values[vernacularNameField] && current.values[scientificNameField] ?
            current.values[vernacularNameField] + ', ' + current.values[scientificNameField] :
            current.values[vernacularNameField] || current.values[scientificNameField];
          if (!cumulative[name]) {
            cumulative[name] = {species: name, count: 0};
          }
          cumulative[name]['count'] += current.count;
          cumulative[name][status] = current.count;
          return cumulative;
        }, {})),
        map(data => Object.keys(data).map(key => data[key]).sort((a, b) => b.count - a.count)),
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
