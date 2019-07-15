import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { ISettingResultList } from '../../shared/service/user.service';

const DEFAULT_PAGE_SIZE = 100;

@Component({
  selector: 'laji-observation-result-list',
  templateUrl: './observation-result-list.component.html',
  styleUrls: ['./observation-result-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationResultListComponent implements OnInit {
  private static readonly defaultFields: string[] = [
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

  @ViewChild('documentModal') public modal: ModalDirective;
  @Input() query: WarehouseQueryInterface;
  @Input() visible: boolean;

  @Output() settingsChange = new EventEmitter<ISettingResultList>();

  selectedFields = ObservationResultListComponent.defaultFields;
  pageSize: number;
  aggregateBy: string[] = [];

  shownDocument = '';
  highlightId = '';
  documentModalVisible = false;

  @Input()
  set settings(settings: ISettingResultList) {
    if (!settings) {
      settings = {};
    }
    this.aggregateBy = settings.aggregateBy || [];
    this.selectedFields = settings.selected || this.selectedFields;
    this.pageSize = settings.pageSize || DEFAULT_PAGE_SIZE;
  }

  ngOnInit() {
    this.modal.config = {animated: false};
  }

  showDocument(event) {
    const row = event.row || {};
    if (row.document && row.document.documentId && row.unit && row.unit.unitId) {
      this.highlightId = row.unit.unitId;
      this.shownDocument = row.document.documentId;
      this.modal.show();
    }
  }

  setPageSize(size: number) {
    if (size !== this.pageSize) {
      this.pageSize = size;
      this.saveSettings();
    }
  }

  setSelectedFields(fields: string[]) {
    this.selectedFields = [...fields];
    this.saveSettings();
  }

  resetSelectedFields() {
    this.selectedFields = [ ...ObservationResultListComponent.defaultFields ];
    this.saveSettings();
  }

  private saveSettings() {
    this.settingsChange.emit({
      aggregateBy: this.aggregateBy,
      selected: this.selectedFields,
      pageSize: this.pageSize
    });
  }

}
