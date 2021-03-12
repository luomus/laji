import {Component, ChangeDetectionStrategy, Input, OnChanges, Output, EventEmitter} from '@angular/core';
import {of as ObservableOf} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Util} from '../../../../../../laji/src/app/shared/service/util.service';
import {RegionalFilterQuery, RegionalService} from '../../../iucn-shared/service/regional.service';
import {RegionalListType} from '../regional.component';
import {TaxonService} from '../../../iucn-shared/service/taxon.service';
import {TranslateService} from '@ngx-translate/core';

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

  cache: any = {};
  baseQuery = {};

  redListStatusQuery$: any;

  @Output() queryChange = new EventEmitter<RegionalFilterQuery>();

  constructor(
    private translate: TranslateService,
    private taxonService: TaxonService,
    private resultService: RegionalService
  ) { }

  ngOnChanges() {
    this.initQueries();
  }

  changeQuery(field: string, value: any) {
    this.queryChange.emit({
      ...this.query,
      [field]: value
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

    this.initStatusQuery();
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
      ObservableOf(this.cache[cacheKey]) :
      this.taxonService.getRedListStatusQuery(query, lang, statusField, this.resultService.rootGroups).pipe(
        tap(data => this.setCache(cacheKey, data, currentQuery))
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
