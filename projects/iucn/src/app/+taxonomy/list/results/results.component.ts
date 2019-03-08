import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output, ViewChild
} from '@angular/core';
import { ListType } from '../list.component';
import { FilterQuery, ResultService } from '../../../iucn-shared/service/result.service';
import { TaxonomyApi } from '../../../../../../../src/app/shared/api/TaxonomyApi';
import { Observable, of as ObservableOf, forkJoin as ObservableForkJoin, of } from 'rxjs';
import { RedListStatusData } from './red-list-status/red-list-status.component';
import { map, share, switchMap, tap } from 'rxjs/operators';
import { Util } from '../../../../../../../src/app/shared/service/util.service';
import { Taxonomy } from '../../../../../../../src/app/shared/model/Taxonomy';
import { ChartData, SimpleChartData } from './red-list-chart/red-list-chart.component';
import { TriplestoreLabelService } from '../../../../../../../src/app/shared/service/triplestore-label.service';
import { TaxonService } from '../../../iucn-shared/service/taxon.service';
import { RedListTaxonGroup } from '../../../../../../../src/app/shared/model/RedListTaxonGroup';
import { RedListHabitatData } from './red-list-habitat/red-list-habitat.component';
import { MetadataService } from '../../../../../../../src/app/shared/service/metadata.service';
import { IPageChange } from '../../../../../../../src/app/shared-modules/datatable/data-table-footer/data-table-footer.component';
import { TranslateService } from '@ngx-translate/core';
import { ISelectFields } from '../../../../../../../src/app/shared-modules/select-fields/select-fields/select-fields.component';
import { TaxonExportService } from '../../../../../../../src/app/+taxonomy/species/service/taxon-export.service';
import { TaxonomyColumns } from '../../../../../../../src/app/+taxonomy/species/service/taxonomy-columns';
import { DatatableColumn } from '../../../../../../../src/app/shared-modules/datatable/model/datatable-column';
import { DownloadComponent } from '../../../../../../../src/app/shared-modules/download/download.component';

@Component({
  selector: 'laji-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultsComponent implements OnChanges {


  @ViewChild(DownloadComponent) speciesDownload: DownloadComponent;

  @Input() type: ListType;
  @Input() query: FilterQuery;
  @Input() checklist: string;
  @Output() queryChange = new EventEmitter<FilterQuery>();

  lang: string;
  redListStatusQuery$: Observable<RedListStatusData[]>;
  speciesQuery$: Observable<Taxonomy[]>;
  threadQuery$: Observable<ChartData[]>;
  habitatQuery$: Observable<RedListHabitatData[]>;
  habitatChartQuery$: Observable<SimpleChartData[]>;
  reasonsQuery$: Observable<ChartData[]>;

  habitats: SimpleChartData[] = [];

  cache: any = {};
  baseQuery = {};
  statusMap = {};

  colors = ['#d81e05', '#fc7f3f', '#f9e814', '#cce226', '#60c659', '#bfbfbf', '#777', '#000'];

  colorSchema = [];
  speciesPageSize = 100;
  speciesPage = 1;
  speciesCount = 0;

  defaultSpeciesFields = [
    {label: 'iucn.results.column.species', key: 'species'},
    {label: 'iucn.results.column.status', key: 'status'},
    {label: 'iucn.results.column.habitat', key: 'habitat'},
    {label: 'iucn.results.column.reasons', key: 'reasons'},
    {label: 'iucn.results.tab.threats', key: 'threats'},
  ];
  selectedSpeciesFields;
  speciesAllFields = [
    {label: 'iucn.results.column.species', key: 'species'},
    {label: 'iucn.results.column.status', key: 'status'},
    {label: 'iucn.results.column.species', key: 'habitat'},
    {label: 'iucn.results.column.reasons', key: 'reasons'},
    {label: 'iucn.results.tab.threats', key: 'threats'},
    {label: 'result.scientificName', key: 'scientificName'},
    {label: 'iucn.results.column.vernacularName', key: 'vernacularName'},
    {label: 'iucn.results.column.reasonForStatusChange', key: 'reasonForStatusChange'},
    {label: 'iucn.results.column.criteriaForStatus', key: 'criteriaForStatus'},
    {label: 'iucn.results.column.class2015', key: '2015'},
    {label: 'iucn.results.column.class2010', key: '2010'}
  ];
  labels = {
    'redListStatusesInFinland': 'iucn.results.redListStatusesInFinland',
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
  exportTemplates = {
    'latestRedListEvaluation.secondaryHabitats.habitat': 'latestRedListEvaluation.secondaryHabitats',
    'redListStatusesInFinland': 'redListStatusesInFinland',
    'vernacularName.fi': 'vernacularName',
    'vernacularName.en': 'vernacularName',
    'vernacularName.sv': 'vernacularName',
    'latestRedListEvaluation.criteriaForStatus': 'latestRedListEvaluation.criteriaForStatus'
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
    private taxonExportService: TaxonExportService,
    private taxonomyColumns: TaxonomyColumns
  ) {
    this.statusMap = Object.keys(this.resultService.shortLabel).reduce((result, key) => {
      result[this.resultService.shortLabel[key]] = key;
      return result;
    }, {});
  }

  ngOnChanges() {
    if (!this.init) {
      this.lang = this.translate.currentLang;
      this.init = true;
    }
    this.initQueries();
  }

  habitatPieSelect(event) {
    const idx = this.habitats.findIndex(val => val.name === event.name);
    if (idx === -1) {
      return;
    }
    this.changeQuery('habitat', this.habitats[idx].id);
  }

  private initQueries() {
    this.baseQuery = Util.removeUndefinedFromObject({
      checklistVersion: this.checklist,
      id: this.query.taxon,
      redListEvaluationGroups: this.query.redListGroup,
      'latestRedListEvaluation.redListStatus': (this.query.status || []).map(status => this.statusMap[status] || status).join(','),
      [this.query.onlyPrimaryReason ?
        'latestRedListEvaluation.primaryEndangermentReason' : 'latestRedListEvaluation.endangermentReasons']: this.query.reasons,
      [this.query.onlyPrimaryHabitat ?
        'latestRedListEvaluation.primaryHabitat' : 'latestRedListEvaluation.anyHabitat']: this.getHabitat(this.query),
      [this.query.onlyPrimaryThreat ?
        'latestRedListEvaluation.primaryThreat' : 'latestRedListEvaluation.threats']: this.query.threats,
      hasLatestRedListEvaluation: true,
      includeHidden: true
    });
    if (this.query.speciesFields) {
      this.selectedSpeciesFields = this.query.speciesFields.split(',').map(field => {
        const idx = this.speciesAllFields.findIndex(item => item.key === field);
        return this.speciesAllFields[idx];
      }).filter(item => !!item);
    }
    if (!this.selectedSpeciesFields || this.selectedSpeciesFields.length === 0) {
      this.selectedSpeciesFields = this.defaultSpeciesFields;
    }
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
      [statusField]: this.baseQuery[statusField] || this.resultService.habitatStatuses.join(','),
      aggregateBy: primaryField  + ',' + statusField + '=' + primaryField + ';' + allField + ',' + statusField + '=' + allField,
      aggregateSize: 10000
    };
    const currentQuery = JSON.stringify(query);
    const hasHabitatQuery = !!query['latestRedListEvaluation.primaryHabitat'] || !!query['latestRedListEvaluation.anyHabitat'];

    this.habitatQuery$ = this.hasCache(cacheKey, currentQuery) ?
      ObservableOf(this.cache[cacheKey]) :
      this.taxonApi.species(query, this.lang, '1', '0').pipe(
        map(data => this.extractHabitat(data, primaryField, allField, statusField)),
        switchMap(data => this.metadataService.getRange('MKV.habitatEnum').pipe(
          map(label => label.reduce((cumulative, current) => {
            const idx = data.findIndex(d => d.name === current.id);
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
          const parents = {};
          const changeIdx = {};
          data.forEach((h, idx) => {
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
          const spots = [];
          Object.keys(changeIdx).forEach(parent => {
            spots.push({parent: parent, spot: changeIdx[parent]});
          });
          spots.sort((a, b) => b.spot - a.spot);
          let curSpot = data.length;
          spots.forEach(s => {
            data.splice(curSpot, 0, parents[s.parent]);
            curSpot = s.spot;
          });
          return data;
        }),
        switchMap(data => this.fetchLabels(data.map(a => a.name)).pipe(
          map(translations => data.map(a => ({
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
      map(habitat => habitat
        .filter(h => !h.isTotal)
        .map((h, index) => {
          const color = this.colors[index % this.colors.length];
          this.colorSchema.push({name: h.name, value: color});
          return {name: h.name, value: h.primary.total, id: h.id};
        })
      ),
      tap(val => this.habitats = val)
    );
  }

  private combineHabitat(data) {
    const lookup = {};
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

  private getSpeciesFields() {
    return [
      'id',
      'scientificName',
      'vernacularName.' + this.lang,
      'cursiveName',
      'redListStatusesInFinland',
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

  private getSpeciesQuery(page = '1') {
    return {
      ...this.baseQuery,
      page: page,
      selectedFields: this.getSpeciesFields().join(',')
    };
  }

  private initSpeciesListQuery(): void  {
    const cacheKey = 'species';
    const query = this.getSpeciesQuery(this.query.page || '1');

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

  private getAllSpecies(data: Taxonomy[] = [], page = '1', pageSize = '10000'): Observable<Taxonomy[]> {
    const query = this.getSpeciesQuery(page);
    return this.taxonApi.species(query, this.lang, page, pageSize).pipe(
      switchMap(result => {
        data.push(...result.results);
        if (result.lastPage > result.currentPage) {
          return this.getAllSpecies(data, '' + (result.currentPage + 1));
        } else {
          return of(data);
        }
      })
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

  changeQuery(field: string, value: any) {
    this.queryChange.emit({
      ...this.query,
      [field]: value
    });
  }

  changeSpeciesPage(event: IPageChange) {
    this.queryChange.emit({
      ...this.query,
      page: '' + event.page
    });
  }

  newFields(event: ISelectFields[]) {
    this.queryChange.emit({
      ...this.query,
      speciesFields: (event || []).map(e => e.key).join(',')
    });
  }

  download(type: string) {
    this.downloadLoading = true;
    const skip = [
      'cursiveName',
      'latestRedListEvaluation.possiblyRE',
      'latestRedListEvaluation.externalPopulationImpactOnRedListStatus',
      'latestRedListEvaluation.primaryHabitat.habitatSpecificTypes',
      'latestRedListEvaluation.secondaryHabitats.habitatSpecificTypes',
      'redListStatusesInFinland'
    ];
    const columns: DatatableColumn[] = this.getSpeciesFields()
      .reduce((cumulative, current) => {
        if (!skip.includes(current)) {
          cumulative.push((!this.exportTemplates[current] ? this.taxonomyColumns.getColumn(current) : false) || {
            name: this.exportTemplates[current] || current,
            cellTemplate: this.exportTemplates[current] || 'label',
            label: this.labels[current] ? this.translate.instant(this.labels[current]) : current
          });
        }
        return cumulative;
      }, []);
    const criteria = document.getElementById('enabled-filters');
    const first = criteria ? [criteria.innerText] : undefined;
    this.getAllSpecies().pipe(
      switchMap(data => this.taxonExportService.downloadTaxons(columns, data, type, first))
    ).subscribe(() => {
      this.downloadLoading = false;
      this.speciesDownload.modal.hide();
      this.cdr.markForCheck();
    });
  }
}
