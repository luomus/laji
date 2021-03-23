import {Component, ChangeDetectorRef, ChangeDetectionStrategy, Input, OnChanges, Output, EventEmitter} from '@angular/core';
import {of, Observable} from 'rxjs';
import {tap, map, switchMap} from 'rxjs/operators';
import {Util} from '../../../../../../laji/src/app/shared/service/util.service';
import {RegionalFilterQuery, RegionalService} from '../../../iucn-shared/service/regional.service';
import {RegionalListType} from '../regional.component';
import {TaxonService} from '../../../iucn-shared/service/taxon.service';
import {TranslateService} from '@ngx-translate/core';
import { Taxonomy } from '../../../../../../laji/src/app/shared/model/Taxonomy';
import { TaxonomyApi } from '../../../../../../laji/src/app/shared/api/TaxonomyApi';
import { ISelectFields } from '../../../../../../laji/src/app/shared-modules/select-fields/select-fields/select-fields.component';
import { TaxonomyColumns } from '../../../../../../laji/src/app/+taxonomy/species/service/taxonomy-columns';
import { DatatableColumn } from '../../../../../../laji/src/app/shared-modules/datatable/model/datatable-column';
import { TaxonExportService } from '../../../../../../laji/src/app/+taxonomy/species/service/taxon-export.service';

@Component({
  selector: 'laji-regional-results',
  templateUrl: './regional-results.component.html',
  styleUrls: ['./regional-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegionalResultsComponent implements OnChanges {
  @Input() type: RegionalListType;
  @Input() query: RegionalFilterQuery;
  @Input() checklist: string;

  @Output() queryChange = new EventEmitter<RegionalFilterQuery>();

  cache: any = {};
  baseQuery = {};

  redListStatusQuery$: any;
  speciesQuery$: Observable<Taxonomy[]>;

  speciesPageSize = 100;
  speciesPage = 1;
  speciesCount = 0;

  defaultSpeciesFields = [
    {label: 'iucn.results.column.species', key: 'species'}
  ];
  speciesAllFields = [
    {label: 'iucn.results.column.species', key: 'species'},
    {label: 'iucn.results.column.id', key: 'id'},
    {label: 'result.scientificName', key: 'scientificName'},
    {label: 'iucn.results.column.vernacularName', key: 'vernacularName'},
    {label: 'iucn.results.column.informalTaxonGroup', key: 'informalTaxonGroup'},
    {label: 'iucn.results.column.class2019', key: 'status'},
    {label: 'iucn.results.column.habitat', key: 'habitat'}
  ];
  selectedSpeciesFields: string[];

  exportKeyMap = {
    'species': 'taxonName',
    'status': 'latestRedListEvaluation.redListStatus',
    'habitat': 'latestRedListEvaluationHabitats',
    '2015': 'redListStatus2015',
    '2010': 'redListStatus2010'
  };
  exportTemplates = {
    'taxonName': 'taxonName',
    'latestRedListEvaluation.redListStatus': 'label',
    'latestRedListEvaluationHabitats': 'latestRedListEvaluationHabitats',
    'redListStatus2015': 'redListStatus2015',
    'redListStatus2010': 'redListStatus2010'
  };

  downloadLoading = false;

  constructor(
    private translate: TranslateService,
    private taxonService: TaxonService,
    private resultService: RegionalService,
    private taxonApi: TaxonomyApi,
    private taxonomyColumns: TaxonomyColumns,
    private taxonExportService: TaxonExportService,
    private cdr: ChangeDetectorRef
  ) { 
    for (const area of this.resultService.areas) {
      this.defaultSpeciesFields.push({
        label: this.resultService.shortLabel[area], key: area
      });
      this.speciesAllFields.push({
        label: this.resultService.shortLabel[area], key: area
      });
    }
    for (const area of this.resultService.areas) {
      this.speciesAllFields.push({
        label: this.translate.instant('iucn.results.column.occurrence') + ' ' + this.resultService.shortLabel[area],
        key: 'occurrence_' + area
      });
    }
  }

  ngOnChanges() {
    this.initQueries();
  }

  changeQuery(field: string, value: any) {
    this.queryChange.emit({
      ...this.query,
      [field]: value
    });
  }

  newFields(fields: ISelectFields[]) {
    this.changeQuery(
      'speciesFields',
      fields.map(e => e.key).join(',')
    );
  }

  changeSpeciesPage(page: number) {
    this.changeQuery(
      'page',
      '' + page
    );
  }

  download(event: {type: string, fields: ISelectFields[]}) {
    this.downloadLoading = true;
    const columns: DatatableColumn[] = [];

    event.fields.forEach(field => {
      const key = this.exportKeyMap[field.key] || field.key;
      const label = field.label;

      columns.push((!this.exportTemplates[key] ? this.taxonomyColumns.getColumn(key) : false) || {
        name: key,
        cellTemplate: this.exportTemplates[key],
        label: label
      });
    });

    const criteria = document.getElementById('enabled-filters');
    const first = criteria ? [criteria.innerText] : undefined;
    this.getAllSpecies().pipe(
      switchMap(data => this.taxonExportService.downloadTaxons(columns, data, event.type, first))
    ).subscribe(() => {
      this.downloadLoading = false;
      this.cdr.markForCheck();
    });
  }

  private initQueries() {
    this.baseQuery = Util.removeFromObject({
      checklistVersion: this.checklist,
      id: this.query.taxon,
      redListEvaluationGroups: this.query.redListGroup,
      'latestRedListEvaluation.anyHabitat': this.query.habitat,
      'latestRedListEvaluation.threatenedAtArea': (this.query.threatenedAtArea || []).join(','),
      hasLatestRedListEvaluation: true,
      includeHidden: true
    });

    this.selectedSpeciesFields = this.query.speciesFields?.split(',');

    this.initStatusQuery();
    this.initSpeciesListQuery();
  }

  private initStatusQuery() {
    const lang = this.translate.currentLang;

    const cacheKey = 'status';
    const statusField = 'latestRedListEvaluation.threatenedAtArea';

    const query: any = {
      ...this.baseQuery
    };

    const currentQuery = JSON.stringify(query);
    this.redListStatusQuery$ = this.hasCache(cacheKey, currentQuery) ?
      of(this.cache[cacheKey]) :
      this.taxonService.getRedListStatusQuery(query, lang, statusField, this.resultService.rootGroups).pipe(
        tap(data => this.setCache(cacheKey, data, currentQuery))
      );
  }

  private getSpeciesFields() {
    return [
      'id',
      'scientificName',
      'vernacularName.' + this.translate.currentLang,
      'cursiveName',
      'latestRedListEvaluation.threatenedAtArea',
      'informalTaxonGroups',
      'latestRedListEvaluation.redListStatus',
      'latestRedListEvaluation.primaryHabitat.habitat',
      'latestRedListEvaluation.primaryHabitat.habitatSpecificTypes',
      'latestRedListEvaluation.secondaryHabitats.habitat',
      'latestRedListEvaluation.secondaryHabitats.habitatSpecificTypes',
      'latestRedListEvaluation.occurrences'
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
    const query = this.getSpeciesQuery(this.query.page || '1');

    const currentQuery = JSON.stringify(query);
    this.speciesQuery$ = this.hasCache(cacheKey, currentQuery) ?
      of(this.cache[cacheKey]) :
      this.taxonApi.species(query, this.translate.currentLang, this.query.page || '1', '' + this.speciesPageSize).pipe(
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
    return this.taxonApi.species(query, this.translate.currentLang, page, pageSize).pipe(
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

  private setCache(key: string, data: any, query: string) {
    this.cache[key] = data;
    this.cache[key + '_query'] = query;
  }

  private hasCache(key: string, query: string) {
    return !!(this.cache[key + '_query'] && this.cache[key + '_query'] === query);
  }
}
