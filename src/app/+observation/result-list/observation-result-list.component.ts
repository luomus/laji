import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ValueDecoratorService } from './value-decorator.sevice';
import { SearchQuery } from '../search-query.model';
import { TranslateService } from '@ngx-translate/core';
import { LabelPipe } from '../../shared/pipe/label.pipe';
import { ToQNamePipe } from '../../shared/pipe/to-qname.pipe';
import { ModalDirective } from 'ngx-bootstrap';
import { CollectionNamePipe } from '../../shared/pipe/collection-name.pipe';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { UserService } from '../../shared/service/user.service';

@Component({
  selector: 'laji-observation-result-list',
  templateUrl: './observation-result-list.component.html',
  styleUrls: ['./observation-result-list.component.css'],
  providers: [ValueDecoratorService, LabelPipe, ToQNamePipe, CollectionNamePipe]
})
export class ObservationResultListComponent implements OnInit {
  @ViewChild('documentModal') public modal: ModalDirective;
  @Input() query: WarehouseQueryInterface;

  selected: string[] = [];
  pageSize: number;
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
        console.log(data);
        if (data) {
          this.aggregateBy = data.aggregateBy;
          this.selected = data.selected || this.selected;
          this.pageSize = data.pageSize || this.pageSize;
        }
      });
  }

  showDocument(event) {
    if (event.document && event.document.documentId && event.unit && event.unit.unitId) {
      this.highlightId = event.unit.unitId;
      this.shownDocument = event.document.documentId;
      this.modal.show();
    }
  }

  setPageSize(event) {
    this.pageSize = event;
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
