import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SourceService } from '../../shared/service/source.service';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { TranslateService } from '@ngx-translate/core';
import { DocumentViewerFacade } from '../../shared-modules/document-viewer/document-viewer.facade';
import { Global } from '../../../environments/global';

@Component({
  selector: 'laji-identify',
  templateUrl: './identify.component.html',
  styleUrls: ['./identify.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentifyComponent implements OnInit {

  query: WarehouseQueryInterface;
  group: string;
  documentId: string;
  unitId: string;

  formId: string;

  constructor(
    public translateService: TranslateService,
    private sourceService: SourceService,
    private cd: ChangeDetectorRef,
    private documentViewerFacade: DocumentViewerFacade
  ) { }

  ngOnInit() {
    this.formId = Global.forms.whichSpecies;
    this.query = {
          unidentified: true,
          informalTaxonGroupIdIncludingReported: this.group ? [this.group] : []
    };
  }

  onSelectGroup() {
    this.query = {
      ...this.query,
      informalTaxonGroupIdIncludingReported: [this.group]
    };
  }

  onImageSelect(event) {
    this.documentViewerFacade.showDocumentID({
      document: event.documentId,
      highlight: event.unitId,
      identifying: true,
      openAnnotation: true,
      result: undefined
    });
  }

}
