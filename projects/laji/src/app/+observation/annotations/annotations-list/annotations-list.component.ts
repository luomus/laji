import { Component, Input, OnInit } from '@angular/core';
import { PagedResult } from '../../../shared/model/PagedResult';
import {TranslateService} from '@ngx-translate/core';
import { DocumentViewerFacade } from '../../../shared-modules/document-viewer/document-viewer.facade';
import { AnnotationTag } from '../../../shared/model/AnnotationTag';


@Component({
  selector: 'laji-annotations-list',
  templateUrl: './annotations-list.component.html',
  styleUrls: ['./annotations-list.component.scss']
})
export class AnnotationListComponent implements OnInit {

  @Input() result: PagedResult<any>;
  @Input() annotationTags: AnnotationTag[];
  lang: string;
  gathering: any[];
  hasTaxon: boolean;

  constructor(
    private transation: TranslateService,
    private documentViewerFacade: DocumentViewerFacade
  ) { }

  ngOnInit() {
   this.lang = this.transation.currentLang;
  }

  showDocument(value) {
    const row: any = value || {};
    if (row.document && row.document.documentId && row.unit && row.unit.unitId) {
      this.documentViewerFacade.showDocumentID({
        highlight: row.unit.unitId,
        document: row.document.documentId,
        openAnnotation: true,
        result: this.result.results
      });
    }
  }

}
