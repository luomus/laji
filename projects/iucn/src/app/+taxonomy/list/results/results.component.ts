import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { ListType } from '../list.component';
import { FilterQuery, ResultService } from '../../../iucn-shared/service/result.service';
import { TaxonomyApi } from '../../../../../../laji/src/app/shared/api/TaxonomyApi';
import { forkJoin as ObservableForkJoin, Observable, of as ObservableOf} from 'rxjs';
import { RedListStatusData } from './red-list-status/red-list-status.component';
import { map, share, switchMap, tap } from 'rxjs/operators';
import { Util } from '../../../../../../laji/src/app/shared/service/util.service';
import { Taxonomy } from '../../../../../../laji/src/app/shared/model/Taxonomy';
import { TriplestoreLabelService } from '../../../../../../laji/src/app/shared/service/triplestore-label.service';
import { TaxonService } from '../../../iucn-shared/service/taxon.service';
import { RedListHabitatData } from './red-list-habitat/red-list-habitat.component';
import { MetadataService } from '../../../../../../laji/src/app/shared/service/metadata.service';
import { TranslateService } from '@ngx-translate/core';
import { ISelectFields } from '../../../../../../laji/src/app/shared-modules/select-fields/select-fields/select-fields.component';
import { Params } from '@angular/router';
import { IucnTaxonExportService } from '../../../iucn-shared/service/iucn-taxon-export.service';
import { IUCNChartData } from './red-list-chart/red-list-chart.component';
import {ActiveElement, ChartData, ChartEvent, ChartOptions} from 'chart.js';
import { PagedResult } from 'projects/laji/src/app/shared/model/PagedResult';

@Component({
  selector: 'iucn-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultsComponent implements OnChanges {
  @Input() type!: ListType;
  @Input() query!: FilterQuery;
  @Input() checklist!: string;
  @Output() queryChange = new EventEmitter<FilterQuery>();

  lang!: string;
  year?: string;
  redListStatusQuery$!: Observable<RedListStatusData[]>;
  speciesQuery$!: Observable<Taxonomy[]>;
  threadQuery$!: Observable<IUCNChartData[]>;
  habitatQuery$!: Observable<RedListHabitatData[]>;
  habitatChartQuery$!: Observable<ChartData>;
  reasonsQuery$!: Observable<IUCNChartData[]>;

  habitatIds: string[] = [];

  cache: any = {};
  baseQuery: any = {};
  statusMap: any = {};

  colors = ['#d81e05', '#fc7f3f', '#f9e814', '#cce226', '#60c659', '#bfbfbf', '#777', '#000'];

  colorSchema = [];
  speciesPageSize = 100;
  speciesPage = 1;
  speciesCount = 0;

  taxonLinkQueryParams: Params = {};

  defaultSpeciesFields = [
    {label: 'iucn.results.column.species', key: 'species'},
    {label: 'iucn.results.column.status', key: 'status'},
    {label: 'iucn.results.column.habitat', key: 'habitat'},
    {label: 'iucn.results.column.reasons', key: 'reasons'},
    {label: 'iucn.results.tab.threats', key: 'threats'},
  ];
  speciesAllFields = [
    {label: 'iucn.results.column.species', key: 'species'},
    {label: 'iucn.results.column.status', key: 'status'},
    {label: 'iucn.results.column.habitat', key: 'habitat'},
    {label: 'iucn.results.column.reasons', key: 'reasons'},
    {label: 'iucn.results.tab.threats', key: 'threats'},
    {label: 'iucn.results.column.id', key: 'id'},
    {label: 'result.scientificName', key: 'scientificName'},
    {label: 'iucn.results.column.vernacularName', key: 'vernacularName'},
    {label: 'iucn.results.column.informalTaxonGroup', key: 'redListGroup'},
    {label: 'iucn.results.column.reasonForStatusChange', key: 'reasonForStatusChange'},
    {label: 'iucn.results.column.criteriaForStatus', key: 'criteriaForStatus'},
    {label: 'iucn.results.column.class2015', key: '2015'},
    {label: 'iucn.results.column.class2010', key: '2010'}
  ];
  selectedSpeciesFields!: string[];
  labels = {
    redListStatusesInFinland: 'iucn.results.redListStatusesInFinland',
    'latestRedListEvaluation.redListStatus': 'iucn.results.column.status',
    'latestRedListEvaluation.criteriaForStatus': 'iucn.results.column.criteriaForStatus',
    'latestRedListEvaluation.endangermentReasons': 'iucn.results.column.reasons',
    'latestRedListEvaluation.reasonForStatusChange': 'iucn.results.column.reasonForStatusChange',
    'latestRedListEvaluation.primaryHabitat.habitat': 'iucn.results.habitat.primaryFull',
    'latestRedListEvaluation.secondaryHabitats.habitat': 'iucn.results.habitat.other',
    'latestRedListEvaluation.threats': 'iucn.results.tab.threats',
    'vernacularName.fi': 'iucn.results.column.vernacularName',
    'vernacularName.en': 'iucn.results.column.vernacularName',
    'vernacularName.sv': 'iucn.results.column.vernacularName',
  };
  options: ChartOptions = {
    onClick: this.habitatPieSelect.bind(this),
  };

  downloadLoading = false;
  init = false;

  constructor(
    private taxonApi: TaxonomyApi,
    private resultService: ResultService,
    private triplestoreLabelService: TriplestoreLabelService,
    private metadataService: MetadataService,
    private taxonService: TaxonService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private taxonExportService: IucnTaxonExportService
  ) {
    this.statusMap = Object.keys(this.resultService.shortLabel).reduce((result: {[key: string]: string}, key: string) => {
      result[this.resultService.shortLabel[key as keyof typeof this.resultService.shortLabel]] = key;
      return result;
    }, {});
  }

  ngOnChanges() {
    if (!this.init) {
      this.lang = this.translate.currentLang;
      this.init = true;
    }
    this.year = this.resultService.getYearFromChecklistVersion(this.checklist);
    this.initQueries();
  }

  habitatPieSelect(event: ChartEvent, elements: ActiveElement[]) {
    if (!elements[0]) {
      return;
    }
    this.changeQuery('habitat', this.habitatIds[elements[0].index]);
  }

  private initQueries() {
    this.baseQuery = Util.removeFromObject({
      checklistVersion: this.checklist,
      id: this.query.taxon,
      redListEvaluationGroups: this.query.redListGroup,
      'latestRedListEvaluation.redListStatus': (this.query.status || []).map(status => this.statusMap[status] || status).join(','),
      [this.query.onlyPrimaryReason ?
        'latestRedListEvaluation.primaryEndangermentReason' : 'latestRedListEvaluation.endangermentReasons']: this.query.reasons,
      [this.query.onlyPrimaryHabitat ?
        'latestRedListEvaluation.primaryHabitat' : 'latestRedListEvaluation.anyHabitat']: this.getHabitat(this.query),
      [this.query.onlyPrimaryThreat ?
        'latestRedListEvaluation.primaryThreat' : 'latestRedListEvaluation.threats']: this.query.threats,
      hasLatestRedListEvaluation: true,
      includeHidden: true
    });

    this.selectedSpeciesFields = this.query.speciesFields ? this.query.speciesFields.split(',') : [];
    this.taxonLinkQueryParams = {
      year: this.year
    };

    this.initStatusQuery();
    this.initSpeciesListQuery();
    this.initThreads();
    this.initHabitat();
    this.initReasons();
  }

  private getHabitat(query: FilterQuery) {
    return query.habitat ? (query.habitatSpecific ? query.habitat + '[' + query.habitatSpecific + ']' : query.habitat) : undefined;
  }

  private initReasons() {
    const primary = this.translate.instant('iucn.threatPrimary');
    const any = this.translate.instant('iucn.threatAny');
    this.reasonsQuery$ = this.getGraph(
      'reasons',
      this.baseQuery,
      'latestRedListEvaluation.primaryEndangermentReason',
      'latestRedListEvaluation.endangermentReasons',
      primary,
      any,
      ['MKV.endangermentReasonMuu', 'MKV.endangermentReasonT']
    );
  }

  private initThreads() {
    const primary = this.translate.instant('iucn.threatPrimary');
    const any = this.translate.instant('iucn.threatAny');
    this.threadQuery$ = this.getGraph(
      'threats',
      this.baseQuery,
      'latestRedListEvaluation.primaryThreat',
      'latestRedListEvaluation.threats',
      primary,
      any,
      ['MKV.endangermentReasonMuu', 'MKV.endangermentReasonT']
    );
  }

  private getGraph(cacheKey: string, baseQuery: any, primaryField: string, allField: string,
      primaryLabel: any, allLabel: any, lastKeys: string[] = []): Observable<IUCNChartData[]> {
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
          const lookup: any = {};
          const result: any[] = [];
          const last: any = {};

          data.aggregations![primaryField].forEach(agg => {
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
          data.aggregations![allField].forEach(agg => {
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
          map(translations => data.map(a => ({...a, name: translations[a.name], id: a.name})))
        )),
        tap(data => this.setCache(cacheKey, data, currentQuery))
      );
  }

  private initHabitat() {
    const cacheKey = 'habitat';
    const primaryField = 'latestRedListEvaluation.primaryHabitat.habitat';
    const allField = 'latestRedListEvaluation.secondaryHabitats.habitat';
    const statusField = 'latestRedListEvaluation.redListStatus';
    const query: any = {
      ...this.baseQuery,
      [statusField]: this.baseQuery[statusField] || this.resultService.habitatStatuses.join(','),
      aggregateBy: primaryField  + ',' + statusField + '=' + primaryField + ';' + allField + ',' + statusField + '=' + allField,
      aggregateSize: 10000
    };
    const currentQuery = JSON.stringify(query);
    const hasHabitatQuery = !!query['latestRedListEvaluation.primaryHabitat'] || !!query['latestRedListEvaluation.anyHabitat'];

    this.habitatQuery$ = this.hasCache(cacheKey, currentQuery) ?
      ObservableOf(this.cache[cacheKey]) :
      this.taxonApi.species(query, this.lang, '1', '0').pipe(
        map(data => this.extractHabitat(data, primaryField, allField, statusField)),
        switchMap((data: any) => this.metadataService.getRange('MKV.habitatEnum').pipe(
          map(label => label.reduce((cumulative: any, current) => {
            const idx = data.findIndex((d: any) => d.name === current.id);
            if (idx > -1) {
              if (!hasHabitatQuery) {
                data[idx].name = data[idx].name.substring(0, 12);
              }
              cumulative.push(data[idx]);
            }
            return cumulative;
          }, []))
        )),
        map(data => {
          if (!hasHabitatQuery) {
            return data;
          }
          const parents: any = {};
          const changeIdx: any = {};
          data.forEach((h: any, idx: any) => {
            const parent = h.name.substring(0, 12);
            if (parents[parent]) {
              ['primary', 'secondary'].forEach(spot => {
                Object.keys(h[spot]).forEach(key => {
                  if (!parents[parent][spot][key]) {
                    parents[parent][spot][key] = h[spot][key];
                  } else {
                    parents[parent][spot][key] += h[spot][key];
                  }
                });
              });
            } else {
              changeIdx[parent] = idx;
              parents[parent] = {
                name: parent,
                isTotal: true,
                primary: {
                  ...h.primary
                },
                secondary: {
                  ...h.secondary
                }
              };
            }
          });
          const spots: any[] = [];
          Object.keys(changeIdx).forEach(parent => {
            spots.push({parent, spot: changeIdx[parent]});
          });
          spots.sort((a, b) => b.spot - a.spot);
          let curSpot = data.length;
          spots.forEach(s => {
            data.splice(curSpot, 0, parents[s.parent]);
            curSpot = s.spot;
          });
          return data;
        }),
        switchMap(data => this.fetchLabels(data.map((a: any) => a.name)).pipe(
          map(translations => data.map((a: any) => ({
            ...a,
            name: translations[a.name],
            id: a.name,
            unspecified: hasHabitatQuery && a.name.length === 12
          }))),
        )),
        map(data => hasHabitatQuery ? data : this.combineHabitat(data)),
        tap(data => this.setCache(cacheKey, data, currentQuery)),
        share()
      );
    this.initHabitatChart();
  }

  private initHabitatChart() {
    this.colorSchema = [];
    this.habitatChartQuery$ = this.habitatQuery$.pipe(
      tap(habitats => this.habitatIds = habitats.map(({id}) => id!)),
      map(habitats => (
        {
          labels: habitats.map(h => h.name),
          datasets: [{
            data: habitats.map(h => h.primary.total),
            backgroundColor: this.colors
          }]
        }
      )),
    );
  }

  private combineHabitat(data: any[]) {
    const lookup: any = {};
    data.forEach(item => {
      const key = item.name;
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

  private extractHabitat(data: PagedResult<Taxonomy>, primaryField: string, allField: string, statusField: string) {
    const lookup: any = {};
    const count = (agg: any, type: any, field: any) => {
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
    data.aggregations![primaryField].forEach(agg => count(agg, 'primary', primaryField));
    data.aggregations![allField].forEach(agg => count(agg, 'secondary', allField));
    return Object.keys(lookup).map(name => lookup[name]);
  }

  private getSpeciesFields() {
    return [
      'id',
      'scientificName',
      'vernacularName.' + this.lang,
      'cursiveName',
      'redListStatusesInFinland',
      'redListEvaluationGroups',
      'latestRedListEvaluation.redListStatus',
      'latestRedListEvaluation.criteriaForStatus',
      'latestRedListEvaluation.endangermentReasons',
      'latestRedListEvaluation.reasonForStatusChange',
      'latestRedListEvaluation.possiblyRE',
      'latestRedListEvaluation.externalPopulationImpactOnRedListStatus',
      'latestRedListEvaluation.primaryHabitat.habitat',
      'latestRedListEvaluation.primaryHabitat.habitatSpecificTypes',
      'latestRedListEvaluation.secondaryHabitats.habitat',
      'latestRedListEvaluation.secondaryHabitats.habitatSpecificTypes',
      'latestRedListEvaluation.threats'
    ];
  }

  private getSpeciesQuery() {
    return {
      ...this.baseQuery,
      page: this.query.page || '1',
      selectedFields: this.getSpeciesFields().join(',')
    };
  }

  private initSpeciesListQuery(): void  {
    const cacheKey = 'species';
    const query = this.getSpeciesQuery();

    const currentQuery = JSON.stringify(query);
    this.speciesQuery$ = this.hasCache(cacheKey, currentQuery) ?
      ObservableOf(this.cache[cacheKey]) :
      this.taxonService.getSpeciesList(query, this.lang, this.speciesPageSize).pipe(
        tap(data => {
          this.speciesPage = data.currentPage;
          this.speciesCount = data.total;
        }),
        map(data => data.results),
        tap(data => this.setCache(cacheKey, data, currentQuery))
      );
  }

  private getAllSpecies(): Observable<Taxonomy[]> {
    const query = this.getSpeciesQuery();
    return this.taxonService.getAllSpecies(query, this.lang);
  }

  private initStatusQuery() {
    const cacheKey = 'status';
    const statusField = 'latestRedListEvaluation.redListStatus';

    const query: any = {
      ...this.removeKeys(this.baseQuery, [statusField])
    };

    const currentQuery = JSON.stringify(query);
    this.redListStatusQuery$ = this.hasCache(cacheKey, currentQuery) ?
      ObservableOf(this.cache[cacheKey]) :
      this.taxonService.getRedListStatusQuery(query, this.lang, statusField).pipe(
        tap(data => this.setCache(cacheKey, data, currentQuery))
      );
  }

  private fetchLabels(keys: string[]): Observable<{[key: string]: string}> {
    const obs = keys.map(key => this.triplestoreLabelService.get(key, this.lang).pipe(map(val => ({
        key,
        label: val
      }))));
    return ObservableForkJoin(obs).pipe(
      map(data => data.reduce((cumulative: any, current) => {
        cumulative[current.key] = current.label;
        return cumulative;
      }, {}))
    );
  }

  private removeKeys(obj: Record<string, unknown>, keys: string[]) {
    const result: any = {};
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

  changeQuery(field: string, value: any) {
    this.queryChange.emit({
      ...this.query,
      [field]: value
    });
  }

  changeSpeciesPage(page: number) {
    this.queryChange.emit({
      ...this.query,
      page: '' + page
    });
  }

  newFields(fields: ISelectFields[]) {
    this.queryChange.emit({
      ...this.query,
      speciesFields: fields.map(e => e.key).join(',')
    });
  }

  download(event: {type: string; fields: ISelectFields[]}) {
    this.downloadLoading = true;

    this.getAllSpecies().pipe(
      switchMap(data => this.taxonExportService.download(data, event.fields, event.type))
    ).subscribe(() => {
      this.downloadLoading = false;
      this.cdr.markForCheck();
    });
  }
}
