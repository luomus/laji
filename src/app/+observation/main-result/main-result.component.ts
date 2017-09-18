import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Input, OnChanges, OnInit, SimpleChanges,
  ViewChild
} from '@angular/core';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { MainResultService } from './main-result.service';
import { ModalDirective } from 'ngx-bootstrap';
import { UserService } from '../../shared/service/user.service';
import { ObservationTableComponent } from '../../shared-modules/observation-result/observation-table/observation-table.component';

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
  @Input() visible = true;

  aggrQuery: WarehouseQueryInterface;
  mapQuery: WarehouseQueryInterface;
  listQuery: WarehouseQueryInterface;

  title = '';

  documentId: string;
  highlightId: string;
  pageSize = 1000;

  ctrlDown = false;
  showObservationList = false;
  showQueryOnMap = false;
  documentModalVisible = false;
  initialized = false;

  aggregateBy = [
    'unit.linkings.taxon',
    'unit.linkings.taxon.scientificName'
  ];

  selected = [
    'unit.linkings.taxon',
    'document.collectionId',
    'unit.notes',
    'gathering.locality',
    'unit.sex',
    'unit.lifeStage',
    'document.sourceId'
  ];

  constructor(
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
    this.userService.getItem<any>(UserService.SETTINGS_RESULT_LIST)
      .subscribe(data => {
        if (data) {
          this.aggregateBy = data.aggregateBy || this.aggregateBy;
          this.selected = data.selected || this.selected;
          this.pageSize = data.pageSize || this.pageSize;
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
    if (changes.visible && this.visible && this.aggregatedDataTable) {
      this.aggregatedDataTable.refreshTable();
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
    this.aggregatedDataTable.refreshTable();
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
    if (this.ctrlDown) {
      this.showObservationList = true;
    }
    const mapQuery = {...this.aggrQuery};
    const title: string[] = [];
    this.aggregateBy.map(key => {
      try {
        if (key === 'unit.linkings.taxon' && event.unit.linkings.taxon.id) {
          mapQuery.taxonId = event.unit.linkings.taxon.id;
          title.push(event.unit.linkings.taxon.nameFinnish)
        }
        if (key === 'unit.linkings.taxon.scientificName' && event.unit.linkings.taxon.id) {
          mapQuery.taxonId = event.unit.linkings.taxon.id;
          title.push(event.unit.linkings.taxon.scientificName);
        }
        if (key === 'document.collectionId' && event.document.collectionId ) {
          mapQuery.collectionId = event.document.collectionId;
          title.push(event.document.collection)
        }

        if (key === 'document.sourceId' && event.document.sourceId ) {
          mapQuery.sourceId = event.document.sourceId;
          title.push(event.document.source)
        }
      } catch (e) {console.log(e)}
    });
    this.title = title.join('<br>');
    this.mapQuery = mapQuery;
    this.listQuery = {...mapQuery};
  }

  showDocument(event) {
    if (event.document && event.document.documentId && event.unit && event.unit.unitId) {
      this.highlightId = event.unit.unitId;
      this.documentId = event.document.documentId;
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
    this.aggregateBy = event.length ? [...event] : [...this.aggregateBy];
    this.saveSettings();
  }

  setSelectedFields(event) {
    this.selected = event.length ? [...event] : [...this.selected];
    this.saveSettings();
  }

  private saveSettings() {
    this.userService.setItem(UserService.SETTINGS_RESULT_LIST, {
      aggregateBy: this.aggregateBy,
      selected: this.selected,
      pageSize: this.pageSize
    }).subscribe();
  }

}
