import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { SearchQuery } from '../search-query.model';
import { TranslateService } from '@ngx-translate/core';
import { ModalDirective } from 'ngx-bootstrap';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { UserService } from '../../shared/service/user.service';

@Component({
  selector: 'laji-observation-result-list',
  templateUrl: './observation-result-list.component.html',
  styleUrls: ['./observation-result-list.component.css'],
})
export class ObservationResultListComponent implements OnInit {
  @ViewChild('documentModal') public modal: ModalDirective;
  @Input() query: WarehouseQueryInterface;
  @Input() visible: boolean;

  selected: string[] = [
    'unit.taxon',
    'document.collectionId',
    'unit.notes',
    'gathering.locality',
    'unit.sex',
    'unit.lifeStage',
    'document.sourceId'
  ];
  pageSize = 100;
  aggregateBy: string[] = [];

  shownDocument = '';
  highlightId = '';

  constructor(
    public translate: TranslateService,
    private userService: UserService,
    public searchQuery: SearchQuery
  ) {
  }

  ngOnInit() {
    this.userService.getItem<any>(UserService.SETTINGS_RESULT_LIST)
      .subscribe(data => {
        if (data) {
          this.aggregateBy = data.aggregateBy;
          this.selected = data.selected || this.selected;
          this.pageSize = data.pageSize || this.pageSize;
        }
      });
  }

  showDocument(event) {
    const row = event.row || {};
    if (row.document && row.document.documentId && row.unit && row.unit.unitId) {
      this.highlightId = row.unit.unitId;
      this.shownDocument = row.document.documentId;
      this.modal.show();
    }
  }

  setPageSize(event) {
    this.pageSize = event;
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
