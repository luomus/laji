import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { MainResultService } from './main-result.service';
import { ISettingResultList, UserService } from '../../shared/service/user.service';
import { ObservationTableComponent } from '../../shared-modules/observation-result/observation-table/observation-table.component';
import { ObservationTableQueryService } from '../../shared-modules/observation-result/service/observation-table-query.service';
import { BrowserService } from '../../shared/service/browser.service';
import { DocumentViewerFacade } from '../../shared-modules/document-viewer/document-viewer.facade';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

const DEFAULT_PAGE_SIZE = 1000;

@Component({
  selector: 'laji-main-result',
  templateUrl: './main-result.component.html',
  styleUrls: ['./main-result.component.css'],
  providers: [MainResultService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainResultComponent implements OnInit, OnChanges {
  private static readonly defaultFields: string[] = [
    'unit.species'
  ];

  @ViewChild('aggregatedDataTable', { static: false }) public aggregatedDataTable: ObservationTableComponent;

  @Input() query: WarehouseQueryInterface;
  @Input() visible: boolean;

  aggrQuery: WarehouseQueryInterface;
  mapQuery: WarehouseQueryInterface;
  listQuery: WarehouseQueryInterface;

  title = '';

  documentId: string;
  pageSize;

  ctrlDown = false;
  showObservationList = false;
  showQueryOnMap = false;
  documentModalVisible = false;
  initialized = false;

  aggregateBy = MainResultComponent.defaultFields;

  selected: string[] = [
    'unit.taxon',
    'unit.abundanceString',
    'gathering.team',
    'gathering.displayDateTime',
    'gathering.locality',
    'gathering.conversions.ykj10kmCenter',
    'document.collectionId',
    'unit.notes'
  ];

  private viewerSub: Subscription;

  constructor(
    private userService: UserService,
    private browserService: BrowserService,
    private documentViewerFacade: DocumentViewerFacade,
    private cd: ChangeDetectorRef
  ) { }

  @HostListener('document:keydown', ['$event'])
  onCtrlDownHandler(event: KeyboardEvent) {
    if (!this.visible) {
      return;
    }
    if (event.keyCode === 17) {
      this.ctrlDown = true;
    }
    if (event.keyCode === 27 && !this.documentModalVisible) {
      if (this.showObservationList && this.listQuery.ykj10kmCenter) {
        this.removeGridFromList();
      } else if (this.showObservationList) {
        this.closeList();
      } else if (this.showQueryOnMap) {
        this.closeMap();
      }
    }
  }

  @HostListener('document:keyup', ['$event'])
  onCtrlUpHandler(event: KeyboardEvent) {
    if (event.keyCode === 17) {
      this.ctrlDown = false;
    }
  }

  ngOnInit() {
    this.viewerSub = this.documentViewerFacade.showModal$.pipe(
      tap(visible => this.documentModalVisible = visible)
    ).subscribe();
    this.userService.getUserSetting<ISettingResultList>('resultList').subscribe(data => {
        if (data) {
          // change aggregatedBy field to another if needed!
          if (data.aggregateBy) {
            const idx = data.aggregateBy.indexOf('unit.taxon');
            if (idx > -1) {
              data.aggregateBy[idx] = 'unit.species';
            }
          }
          this.aggregateBy = data.aggregateBy || this.aggregateBy;
          this.selected = data.selected || this.selected;
          this.pageSize = data.pageSize || DEFAULT_PAGE_SIZE;
        } else {
          this.pageSize = DEFAULT_PAGE_SIZE;
        }
        this.initialized = true;
        this.initInternalQueries();
        this.cd.markForCheck();
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.query && this.initialized) {
      this.initInternalQueries();
    }
    if (changes.visible) {
      this.browserService.triggerResizeEvent();
    }
  }

  initInternalQueries() {
    this.title = '';
    this.showQueryOnMap = false;
    this.aggrQuery = {...this.query};
    if (!this.aggrQuery.countryId) {
      this.aggrQuery.countryId = ['ML.206'];
    }
    this.mapQuery = {...this.aggrQuery};
    this.listQuery = {...this.aggrQuery};
  }

  closeMap() {
    this.title = '';
    this.showQueryOnMap = false;
    this.mapQuery = {...this.aggrQuery};
    this.closeList();
  }

  closeList() {
    this.showObservationList = false;
    this.browserService.triggerResizeEvent();
  }

  onGridSelect(event) {
    this.showObservationList = true;
    this.listQuery = event;
  }

  removeGridFromList() {
    const query = {...this.listQuery};
    if (query.ykj10kmCenter) {
      delete query.ykj10kmCenter;
    }
    this.listQuery = query;
  }

  onAggregateSelect(event) {
    this.showQueryOnMap = true;
    this.showObservationList = !this.ctrlDown;
    const mapQuery = {...this.aggrQuery};
    ObservationTableQueryService.fieldsToQuery(this.aggregateBy, event.row, mapQuery);
    const title: string[] = [];
    try {
      const cells = [].slice.call(event.cellElement.parentElement.children);
      cells.map(cellElem => {
          const value = (cellElem.innterText || cellElem.textContent).trim();
          if (value && !value.match(/^[0-9\-,.+\sT:]+$/)) {
            title.push(value);
          }
        });
    } catch (e) { console.log(e); }
    this.title = title.join('<br>');
    this.mapQuery = mapQuery;
    this.listQuery = {...mapQuery};
  }

  showDocument(event) {
    const row = event.row || {};
    const listQuery = this.listQuery;
    if (row.document && row.document.documentId && row.unit && row.unit.unitId) {
      this.documentViewerFacade.showDocumentID({
        document: row.document.documentId,
        highlight: row.unit.unitId,
        own: listQuery && (!!listQuery.observerPersonToken || !!listQuery.editorPersonToken || !!listQuery.editorOrObserverPersonToken),
        result: undefined
      });
    }
  }

  setPageSize(event) {
    this.pageSize = event;
    this.saveSettings();
  }

  setAggregateBy(event) {
    this.aggregateBy = [...event];
    this.saveSettings();
  }

  setSelectedFields(event) {
    this.selected = [...event];
    this.saveSettings();
  }

  resetSelectedFields() {
    this.aggregateBy = [ ...MainResultComponent.defaultFields ];
    this.saveSettings();
  }

  private saveSettings() {
    this.userService.setUserSetting('resultList', {
      aggregateBy: this.aggregateBy,
      selected: this.selected,
      pageSize: this.pageSize
    });
  }

}
