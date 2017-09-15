import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { MainResultService } from './main-result.service';
import { ModalDirective } from 'ngx-bootstrap';
import { UserService } from '../../shared/service/user.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'laji-main-result',
  templateUrl: './main-result.component.html',
  styleUrls: ['./main-result.component.css'],
  providers: [MainResultService]
})
export class MainResultComponent implements OnInit, OnChanges {

  @ViewChild('documentModal') public modal: ModalDirective;

  @Input() query: WarehouseQueryInterface;

  aggrQuery: WarehouseQueryInterface;
  mapQuery: WarehouseQueryInterface;
  listQuery: WarehouseQueryInterface;

  title = '';

  documentId: string;
  highlightId: string;
  pageSize = 1000;

  showObservationList = false;
  hasAggregateResult = false;
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

  constructor(private userService: UserService) { }

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
      });
  }

  ngOnChanges() {
    if (this.initialized) {
      this.initInternalQueries();
    }
  }

  initInternalQueries() {
    this.hasAggregateResult = false;
    this.aggrQuery = {...this.query};
    if (!this.aggrQuery.countryId) {
      this.aggrQuery.countryId = ['ML.206'];
    }
    this.mapQuery = {...this.aggrQuery};
    this.listQuery = {...this.aggrQuery};

  }

  showAllOnMap() {
    this.title = '';
    this.hasAggregateResult = false;
    this.showObservationList = false;
    this.mapQuery = {...this.aggrQuery};
  }

  closeList() {
    this.showObservationList = false;
  }

  onGridSelect(event) {
    this.showObservationList = true;
    this.listQuery = event;
  }

  removeGridFromList() {
    this.listQuery = {...this.listQuery, ykj10kmCenter: ''};
  }

  onAggregateSelect(event) {
    this.hasAggregateResult = true;
    this.showObservationList = true;
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
      this.modal.show();
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

  private saveSettings() {
    this.userService.setItem(UserService.SETTINGS_RESULT_LIST, {
      aggregateBy: this.aggregateBy,
      selected: this.selected,
      pageSize: this.pageSize
    }).subscribe();
  }

}
