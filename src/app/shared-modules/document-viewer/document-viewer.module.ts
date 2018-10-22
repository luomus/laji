import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { DocumentComponent } from './document/document.component';
import { LevelComponent } from './level/level.component';
import { ImagesComponent } from './images/images.component';
import { ViewerMapComponent } from './viewer-map/viewer-map.component';
import { RowComponent } from './row/row.component';
import { GatheringComponent } from './gathering/gathering.component';
import { UnitComponent } from './unit/unit.component';
import { ToQNamePipe } from '../../shared/pipe/to-qname.pipe';
import { LcFirstPipe } from './pipe/lc-first.pipe';
import { AnnotationService } from './service/annotation.service';
import { TypeaheadModule } from 'ngx-bootstrap';
import { SecureInfoComponent } from './secure-info/secure-info.component';
import { IssueComponent } from './issue/issue.component';
import { IssuesComponent } from './issues/issues.component';
import { FactsComponent } from './facts/facts.component';
import { LangModule } from '../lang/lang.module';
import { AnnotationsModule } from '../annotations/annotations.module';
import { EditLinkComponent } from './edit-link/edit-link.component';
import { LajiMapModule } from '@laji-map/laji-map.module';
import { DocumentLocalComponent } from './document-local/document-local.component';
import { DocumentObjectComponent } from './document-local/document-object/document-object.component';
import { DocumentLocalViewerViewComponent } from './document-local/document-local-viewer-view/document-local-viewer-view.component';
import { DocumentLocalPrintViewComponent } from './document-local/document-local-print-view/document-local-print-view.component';
import { PrintMapComponent } from './print-map/print-map.component';
import { PrintImagesComponent} from './print-images/print-images.component';
import { DocumentPrintComponent } from './document-print/document-print.component';
import { UnitRowsComponent } from './unit-rows/unit-rows.component';
import { GatheringRowsComponent } from './gathering-rows/gathering-rows.component';
import { CollectionContestPrintComponent } from './document-local/collection-contest-local-print/collection-contest-print.component';
import { PrintRowComponent } from './document-local/collection-contest-local-print/print-row/print-row.component';
import { PrintTaxonHeaderComponent } from './document-local/collection-contest-local-print/print-taxon-header/print-taxon-header.component';

@NgModule({
  imports: [
    SharedModule,
    TypeaheadModule,
    LangModule,
    AnnotationsModule,
    LajiMapModule
  ],
  providers: [ToQNamePipe, AnnotationService],
  declarations: [DocumentComponent, LevelComponent, ImagesComponent, ViewerMapComponent, RowComponent,
    GatheringComponent, UnitComponent, LcFirstPipe, SecureInfoComponent, IssueComponent, IssuesComponent, FactsComponent,
    EditLinkComponent, DocumentLocalComponent, DocumentObjectComponent, DocumentLocalViewerViewComponent,
    DocumentLocalPrintViewComponent, PrintMapComponent, PrintImagesComponent, DocumentPrintComponent, UnitRowsComponent,
    GatheringRowsComponent,
    CollectionContestPrintComponent,
    PrintRowComponent,
    PrintTaxonHeaderComponent],
  exports: [DocumentComponent, DocumentPrintComponent, DocumentLocalComponent]
})
export class DocumentViewerModule { }
