import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input } from '@angular/core';
import { QualityService } from '../quality.service';
import { TranslateService } from '@ngx-translate/core';
import { PagedResult } from '../../../shared/model/PagedResult';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'laji-quality-annotation-table',
  templateUrl: './quality-annotation-table.component.html',
  styleUrls: ['./quality-annotation-table.component.css']
})
export class QualityAnnotationTableComponent implements OnInit, OnDestroy {
  @Input() pageSize = 50;

  page = 1;
  group = '';
  timeStart = '';
  timeEnd = '';

  result: PagedResult<any> = {
    currentPage: 1,
    lastPage: 1,
    results: [],
    total: 0,
    pageSize: 0
  };
  columns = [
    { prop: 'annotation.created', cellTemplate: 'date', label: 'quality.created' },
    { prop: 'annotation.annotationByPerson', cellTemplate: 'fullUser', label: 'quality.creator' },
    { prop: 'annotation', cellTemplate: 'annotation', label: 'quality.qualityLabel' },
    { prop: 'gathering.team', label: 'quality.observer' },
    { name: 'unit.species',
      prop: 'unit',
      target: '_blank',
      label: 'quality.species',
      cellTemplate: 'species',
      sortBy: 'unit.linkings.taxon.speciesName%longLang%',
      selectField: 'unit',
      aggregateBy: 'unit.linkings.taxon.speciesId,' +
      'unit.linkings.taxon.speciesNameFinnish,' +
      'unit.linkings.taxon.speciesNameEnglish,' +
      'unit.linkings.taxon.speciesNameSwedish,' +
      'unit.linkings.taxon.speciesScientificName'
    },
    { prop: 'unit.media.0', cellTemplate: 'image', label: 'quality.image' }
  ];
  loading = true;

  private delayedSearchSource = new Subject<any>();
  private delayedSearch = this.delayedSearchSource.asObservable();
  private debouchAfterChange = 500;
  private subSearch: Subscription;
  private fetchSub: Subscription;

  constructor(
    public translateService: TranslateService,
    private qualityService: QualityService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.subSearch = this.delayedSearch
      .debounceTime(this.debouchAfterChange)
      .subscribe(() => {
        this.fetchPage();
      });
  }

  ngOnDestroy() {
    if (this.subSearch) {
      this.subSearch.unsubscribe();
    }
  }

  onSelectChange() {
    this.delayedSearchSource.next();
  }

  setPage(pageInfo) {
    this.page = pageInfo.offset + 1;
    this.delayedSearchSource.next();
  }

  fetchPage() {
    if (this.fetchSub) {
      this.fetchSub.unsubscribe();
    }

    this.loading = true;
    this.cd.markForCheck();

    this.fetchSub = this.qualityService
      .getAnnotationList(this.page, this.pageSize, this.group, this.timeStart, this.timeEnd)
      .subscribe(data => {
        this.result = data;
        this.loading = false;
        this.cd.markForCheck();
      });
  }
}
