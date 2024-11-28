import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DocumentViewerFacade } from '../../../../shared-modules/document-viewer/document-viewer.facade';
import { WarehouseQueryInterface } from '../../../../shared/model/WarehouseQueryInterface';

@Component({
  selector: 'laji-theme-observation-list',
  templateUrl: './theme-observation-list.component.html',
  styleUrls: ['./theme-observation-list.component.css']
})
export class ThemeObservationListComponent {

  @Input() query!: WarehouseQueryInterface;
  @Input() height!: string;
  @Input() showSettings = false;
  @Input() selected = ['unit.linkings.taxon', 'unit.linkings.taxon.scientificName', 'unit.linkings.taxon.vernacularName', 'gathering.displayDateTime', 'gathering.team'];
  @Output() listClose = new EventEmitter<WarehouseQueryInterface>();
  @Output() selectChange = new EventEmitter();

  loading = false;
  results = {results: []};
  current!: string;

  constructor(
    public translate: TranslateService,
    private documentViewerFacade: DocumentViewerFacade
  ) { }

  showDocument(event: any) {
    const row = event.row || {};
    if (row.document && row.document.documentId && row.unit && row.unit.unitId) {
      this.documentViewerFacade.showDocumentID({
        highlight: row.unit.unitId,
        document: row.document.documentId,
        openAnnotation: false,
        useWorldMap: false,
        result: undefined
      });
    }
  }
}
