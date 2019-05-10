import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { SearchQuery } from '../search-query.model';
import { TranslateService } from '@ngx-translate/core';
import { ModalDirective } from 'ngx-bootstrap';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { UserService } from '../../shared/service/user.service';

const DEFAULT_PAGE_SIZE = 100;

@Component({
  selector: 'laji-observation-result-list',
  templateUrl: './observation-result-list.component.html',
  styleUrls: ['./observation-result-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationResultListComponent implements OnInit {
  @ViewChild('documentModal') public modal: ModalDirective;
  @Input() query: WarehouseQueryInterface;
  @Input() visible: boolean;

  selected: string[] = [
    'unit.taxon',
    'unit.abundanceString',
    'gathering.displayDateTime',
    'gathering.interpretations.countryDisplayname',
    'gathering.interpretations.biogeographicalProvinceDisplayname',
    'gathering.interpretations.municipalityDisplayname',
    'gathering.locality',
    'document.collectionId',
    'gathering.team'
  ];
  pageSize;
  aggregateBy: string[] = [];

  shownDocument = '';
  highlightId = '';
  documentModalVisible = false;

  constructor(
    public translate: TranslateService,
    private userService: UserService,
    private cd: ChangeDetectorRef,
    public searchQuery: SearchQuery
  ) {
  }

  ngOnInit() {
    this.modal.config = {animated: false};
    this.userService.getItem<any>(UserService.SETTINGS_RESULT_LIST)
      .subscribe(data => {
        if (data) {
          this.aggregateBy = data.aggregateBy;
          this.selected = data.selected || this.selected;
          this.pageSize = data.pageSize || DEFAULT_PAGE_SIZE;
        } else {
          this.pageSize = DEFAULT_PAGE_SIZE;
        }
        this.cd.markForCheck();
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
    }).subscribe(() => {}, () => {});
  }

}
