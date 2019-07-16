import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { ISettingResultList } from '../../shared/service/user.service';
import { DocumentViewerFacade } from '../../shared-modules/document-viewer/document-viewer.facade';

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

  @ViewChild('documentModal', { static: true }) public modal: ModalDirective;
  @Input() query: WarehouseQueryInterface;
  @Input() visible: boolean;

  @Output() settingsChange = new EventEmitter<ISettingResultList>();

  selectedFields = ObservationResultListComponent.defaultFields;
  pageSize: number;
  aggregateBy: string[] = [];

  constructor(
    private documentViewerFacade: DocumentViewerFacade
  ) {}

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
    const query = this.query;
    if (row.document && row.document.documentId && row.unit && row.unit.unitId) {
      this.documentViewerFacade.showDocumentID({
        document: row.document.documentId,
        highlight: row.unit.unitId,
        own: query && (!!query.observerPersonToken || !!query.editorPersonToken || !!query.editorOrObserverPersonToken)
      });
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
