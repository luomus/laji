import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { MainResultService } from './main-result.service';
import { ModalDirective } from 'ngx-bootstrap';
import { UserService } from '../../shared/service/user.service';
import { ObservationTableComponent } from '../../shared-modules/observation-result/observation-table/observation-table.component';
import { ObservationTableQueryService } from '../../shared-modules/observation-result/service/observation-table-query.service';
import { WINDOW } from '@ng-toolkit/universal';

const DEFAULT_PAGE_SIZE = 1000;

@Component({
  selector: 'laji-main-result',
  templateUrl: './main-result.component.html',
  styleUrls: ['./main-result.component.css'],
  providers: [MainResultService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainResultComponent implements OnInit, OnChanges {

  @ViewChild('aggregatedDataTable') public aggregatedDataTable: ObservationTableComponent;
  @ViewChild('documentModal') public modal: ModalDirective;

  @Input() query: WarehouseQueryInterface;
  @Input() visible: boolean;
  @Input() lang: string;

  aggrQuery: WarehouseQueryInterface;
  mapQuery: WarehouseQueryInterface;
  listQuery: WarehouseQueryInterface;

  title = '';

  documentId: string;
  highlightId: string;
  pageSize;

  ctrlDown = false;
  showObservationList = false;
  showQueryOnMap = false;
  documentModalVisible = false;
  initialized = false;

  aggregateBy = [
    'unit.species'
  ];

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

  constructor(
    @Inject(WINDOW) private window,
    private userService: UserService,
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
    this.modal.config = {animated: false};
    this.userService.getItem<any>(UserService.SETTINGS_RESULT_LIST)
      .subscribe(data => {
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
    setTimeout(() => {
      this.window.dispatchEvent(new Event('resize'));
    }, 100);
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
    } catch (e) { console.log(e)}
    this.title = title.join('<br>');
    this.mapQuery = mapQuery;
    this.listQuery = {...mapQuery};
  }

  showDocument(event) {
    const row = event.row || {};
    if (row.document && row.document.documentId && row.unit && row.unit.unitId) {
      this.highlightId = row.unit.unitId;
      this.documentId = row.document.documentId;
      this.documentModalVisible = true;
      this.modal.show();
    }
  }

  onHideDocument() {
    this.documentModalVisible = false;
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

  private saveSettings() {
    this.userService.setItem(UserService.SETTINGS_RESULT_LIST, {
      aggregateBy: this.aggregateBy,
      selected: this.selected,
      pageSize: this.pageSize
    }).subscribe(() => {}, () => {});
  }

}
