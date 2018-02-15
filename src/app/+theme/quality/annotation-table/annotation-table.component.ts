import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input, ViewChild } from '@angular/core';
import { QualityService } from '../../service/quality.service';
import { TranslateService } from '@ngx-translate/core';
import { PagedResult } from '../../../shared/model/PagedResult';
import { ModalDirective } from 'ngx-bootstrap';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { AnnotationTableColumn } from '../model/annotation-table-column';

@Component({
  selector: 'laji-annotation-table',
  templateUrl: './annotation-table.component.html',
  styleUrls: ['./annotation-table.component.css']
})
export class AnnotationTableComponent implements OnInit, OnDestroy {
  @Input() pageSize = 50;
  @ViewChild('documentModal') public modal: ModalDirective;

  page = 1;
  group = '';
  timeStart = '';
  timeEnd = '';
  orderBy: string[] = [];

  result: PagedResult<any> = {
    currentPage: 1,
    lastPage: 1,
    results: [],
    total: 0,
    pageSize: 0
  };

  columns: AnnotationTableColumn[] = [
    {
      prop: 'annotation.created',
      cellTemplate: 'date',
      label: 'quality.created',
      sortBy: 'unit.annotations.created',
      width: 120
    },
    {
      prop: 'annotation.annotationByPersonName',
      label: 'quality.creator',
      sortBy: 'unit.annotations.annotationByPersonName'
    },
    {
      prop: 'annotation',
      cellTemplate: 'annotation',
      label: 'quality.qualityLabel',
      sortable: false,
      width: 280
    },
    {
      prop: 'gathering.team',
      label: 'quality.observer'
    },
    {
      name: 'unit.taxon',
      prop: 'unit',
      target: '_blank',
      label: 'quality.taxon',
      cellTemplate: 'taxon',
      sortBy: 'unit.linkings.originalTaxon.name%longLang%',
      width: 280
    },
    {
      prop: 'unit.media.0',
      cellTemplate: 'image',
      label: 'quality.image',
      sortable: false,
      width: 100
    }
  ];

  loading = true;

  shownDocument = '';
  highlightId = '';

  private delayedSearchSource = new Subject<any>();
  private delayedSearch = this.delayedSearchSource.asObservable();
  private debouchAfterChange = 500;
  private subSearch: Subscription;
  private fetchSub: Subscription;

  private langMap = {
    'fi': 'Finnish',
    'sv': 'Swedish',
    'en': 'English'
  };

  constructor(
    private qualityService: QualityService,
    public translateService: TranslateService,
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
    this.page = 1;
    this.delayedSearchSource.next();
  }

  setPage(pageInfo) {
    this.page = pageInfo.offset + 1;
    this.delayedSearchSource.next();
  }

  onSort(event) {
    this.orderBy = event.sorts.map(sort => {
      const col = this.columns.filter(column => column.prop === sort.prop)[0];
      if (!col) {
        return '';
      }
      const sortBy: string =  this.setLangParams(col.sortBy || '' + col.prop);
      return sortBy.split(',').map(val => val + ' ' + sort.dir.toUpperCase()).join(',');
    });
    this.delayedSearchSource.next();
  }

  showDocument(event) {
    const row: any = event.row || {};
    if (row.document && row.document.documentId && row.unit && row.unit.unitId) {
      this.highlightId = row.unit.unitId;
      this.shownDocument = row.document.documentId;
      this.modal.show();
    }
  }

  getRowHeight(row) {
    if (!row) { return 37; }

    if (row.unit && row.unit.media && row.unit.media[0]) {
      return 88;
    } else if (row.annotation && row.annotation.opinion && row.annotation.notes) {
      return 77;
    } else if (row.annotation && (row.annotation.opinion || row.annotation.notes)) {
      return 57;
    }

    return 37;
  }

  private fetchPage() {
    if (this.fetchSub) {
      this.fetchSub.unsubscribe();
    }

    this.loading = true;
    this.cd.markForCheck();

    this.fetchSub = this.qualityService
      .getAnnotationList(this.page, this.pageSize, this.orderBy, this.group, this.timeStart, this.timeEnd)
      .subscribe(data => {
        this.result = data;
        this.loading = false;
        this.cd.markForCheck();
      });
  }

  private setLangParams(value: string) {
    return (value || '')
      .replace('%longLang%', this.langMap[this.translateService.currentLang] || 'Finnish')
  }

}
