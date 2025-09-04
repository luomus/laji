import { Component, ChangeDetectorRef, ChangeDetectionStrategy, Input, OnChanges, Output, EventEmitter, OnDestroy } from '@angular/core';
import { of, Observable, Subscription } from 'rxjs';
import { tap, map, switchMap } from 'rxjs/operators';
import { Util } from '../../../../../../laji/src/app/shared/service/util.service';
import { RegionalFilterQuery, RegionalService } from '../../../iucn-shared/service/regional.service';
import { RegionalListType } from '../regional.component';
import { ChecklistVersion, TaxonFilters, TaxonQuery, TaxonService } from '../../../iucn-shared/service/taxon.service';
import { TranslateService } from '@ngx-translate/core';
import { ISelectFields } from '../../../../../../laji/src/app/shared-modules/select-fields/select-fields/select-fields.component';
import { IucnTaxonExportService } from '../../../iucn-shared/service/iucn-taxon-export.service';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Taxon = components['schemas']['Taxon'];

export type RedListRegionalStatusData = {
  [area: string]: number|string;
 } & {
   species: string;
   count: number;
   group?: string;
};

@Component({
  selector: 'iucn-regional-results',
  templateUrl: './regional-results.component.html',
  styleUrls: ['./regional-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegionalResultsComponent implements OnChanges, OnDestroy {
  @Input() type: RegionalListType = 'status';
  @Input() query: RegionalFilterQuery = {};
  @Input() checklist?: ChecklistVersion;

  @Output() queryChange = new EventEmitter<RegionalFilterQuery>();

  statusEvaluationYear?: string;

  cache: {[key: string]: any} = {};
  baseQuery: TaxonQuery = {};
  baseFilters: TaxonFilters = {};

  redListStatusQuery$?: Observable<RedListRegionalStatusData[]>;
  speciesQuery$?: Observable<Taxon[]>;

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
    {label: 'iucn.results.column.informalTaxonGroup', key: 'redListGroup'},
    {label: 'iucn.results.column.habitat', key: 'habitat'},
    {label: 'iucn.results.column.status', key: 'status'}
  ];
  selectedSpeciesFields: string[] = [];


  downloadLoading = false;

  private areaSub?: Subscription;

  constructor(
    private translate: TranslateService,
    private taxonService: TaxonService,
    private resultService: RegionalService,
    private taxonExportService: IucnTaxonExportService,
    private cdr: ChangeDetectorRef
  ) {
    this.initAreaColumns();
  }

  ngOnChanges() {
    if (this.checklist) {
      this.statusEvaluationYear = this.resultService.getStatusEvaluationYearFromChecklistVersion(this.checklist);
    }

    this.initQueries();
  }

  ngOnDestroy() {
    if (this.areaSub) {
      this.areaSub.unsubscribe();
    }
  }

  changeQuery<K extends keyof RegionalFilterQuery, T extends RegionalFilterQuery[K]>(field: K, value: T) {
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
    this.changeQuery('page', page);
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

  private initQueries() {
    this.baseQuery = Util.removeFromObject({
      checklistVersion: this.checklist,
      includeHidden: true
    });
    this.baseFilters = Util.removeFromObject({
      redListEvaluationGroups: this.query.redListGroup,
      'latestRedListEvaluation.anyHabitatSearchStrings': this.query.habitat,
      'latestRedListEvaluation.threatenedAtArea': this.query.threatenedAtArea || [],
      hasLatestRedListEvaluation: true,
    });

    this.selectedSpeciesFields = this.query.speciesFields ? this.query.speciesFields.split(',') : [];

    this.initStatusQuery();
    this.initSpeciesListQuery();
  }

  private initStatusQuery() {
    const lang = this.translate.currentLang;

    const cacheKey = 'status';
    const statusField = 'latestRedListEvaluation.threatenedAtArea';

    const query = this.baseQuery;
    const filters = this.baseFilters;

    const currentQueryAndFilters = JSON.stringify({ taxon: this.query.taxon, ...query, ...filters });
    this.redListStatusQuery$ = this.hasCache(cacheKey, currentQueryAndFilters) ?
      of(this.cache[cacheKey]) :
      this.taxonService.getRedListStatusQuery(this.query.taxon, query, filters, lang, statusField, this.resultService.rootGroups).pipe(
        tap(data => this.setCache(cacheKey, data, currentQueryAndFilters))
      );
  }

  private getSpeciesFields() {
    return [
      'id',
      'scientificName',
      'vernacularName',
      'cursiveName',
      'redListStatusesInFinland',
      'latestRedListEvaluation.threatenedAtArea',
      'redListEvaluationGroups',
      'latestRedListEvaluation.redListStatus',
      'latestRedListEvaluation.primaryHabitat.habitat',
      'latestRedListEvaluation.primaryHabitat.habitatSpecificTypes',
      'latestRedListEvaluation.secondaryHabitats.habitat',
      'latestRedListEvaluation.secondaryHabitats.habitatSpecificTypes',
      'latestRedListEvaluation.occurrences'
    ];
  }

  private getSpeciesQuery() {
    return {
      ...this.baseQuery,
      page: this.query.page || 1,
      selectedFields: this.getSpeciesFields().join(',')
    };
  }

  private initSpeciesListQuery(): void  {
    const cacheKey = 'species';
    const query = this.getSpeciesQuery();
    const filters = this.baseFilters;

    const currentQueryAndFilters = JSON.stringify({ taxon: this.query.taxon, ...query, ...filters });
    this.speciesQuery$ = this.hasCache(cacheKey, currentQueryAndFilters) ?
      of(this.cache[cacheKey]) :
      this.taxonService.getSpeciesList(this.query.taxon, query, filters, this.speciesPageSize).pipe(
        tap(data => {
          this.speciesPage = data.currentPage;
          this.speciesCount = data.total;
        }),
        map(data => data.results),
        tap(data => this.setCache(cacheKey, data, currentQueryAndFilters))
      );
  }

  private getAllSpecies(): Observable<Taxon[]> {
    return this.taxonService.getAllSpecies(this.getSpeciesQuery(), this.baseFilters);
  }

  private setCache(key: string, data: any, query: string) {
    this.cache[key] = data;
    this.cache[key + '_query'] = query;
  }

  private hasCache(key: string, query: string) {
    return !!(this.cache[key + '_query'] && this.cache[key + '_query'] === query);
  }

  private initAreaColumns() {
    this.areaSub = this.resultService.getAreas(this.translate.currentLang).subscribe(areas => {
      const areaFields = [];
      const occurrenceFields = [];

      for (const area of areas) {
        const key = area.id;
        areaFields.push({
          label: area.shortLabel, key
        });
      }

      for (const area of areas) {
        const key = 'occurrence_' + area.id;
        occurrenceFields.push({
          label: this.translate.instant('iucn.results.column.occurrence') + ' ' + area.shortLabel,
          key
        });
      }

      this.defaultSpeciesFields.splice(1, 0, ...areaFields);
      this.speciesAllFields.splice(1, 0, ...areaFields);
      this.speciesAllFields = this.speciesAllFields.concat(occurrenceFields);

      this.cdr.markForCheck();
    });
  }
}
