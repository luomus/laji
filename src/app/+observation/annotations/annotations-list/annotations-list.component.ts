import { Component, Input, OnInit, Output } from '@angular/core';
import { Annotation } from '../../../shared/model/Annotation';
import { PagedResult } from '../../../shared/model/PagedResult';
import {TranslateService} from '@ngx-translate/core';
import { DocumentViewerFacade } from '../../../shared-modules/document-viewer/document-viewer.facade';


@Component({
  selector: 'laji-annotations-list',
  templateUrl: './annotations-list.component.html',
  styleUrls: ['./annotations-list.component.scss']
})
export class AnnotationListComponent implements OnInit {

  @Input() result: PagedResult<any>;
  lang: string;
  gathering: any[];
  hasTaxon: boolean;

  annotationClass = Annotation.AnnotationClassEnum;

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
