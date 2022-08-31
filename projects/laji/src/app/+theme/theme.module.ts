/* eslint-disable max-len */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeRoutingModule } from './theme-routing.module';
import { HerpetologyComponent } from './herpetology/herpetology.component';
import { SharedModule } from '../shared/shared.module';
import { LangModule } from '../shared-modules/lang/lang.module';
import { YkjModule } from '../shared-modules/ykj/ykj.module';
import { IdentifyComponent } from './identify/identify.component';
import { ThemeComponent } from './theme.component';
import { DatatableModule } from '../shared-modules/datatable/datatable.module';
import { QualityService } from './service/quality.service';
import { QualityComponent } from './quality/quality.component';
import { MostActiveUsersTableComponent } from './quality/most-active-users-table/most-active-users-table.component';
import { AnnotationTableComponent } from './quality/annotation-table/annotation-table.component';
import { QualityFiltersComponent } from './quality/quality-filters/quality-filters.component';
import { ChecklistComponent } from './checklist/checklist.component';
import { InfoPageModule } from '../shared-modules/info-page/info-page.module';
import { LajiUiModule } from '../../../../laji-ui/src/public-api';
import { ObservationComponentModule } from '../+observation/observation-component.module';
import { GeneticResourceComponent } from './genetic-resource/genetic-resource.component';
import { TableColumnService } from '../shared-modules/datatable/service/table-column.service';
import { ObservationTableColumnService } from '../shared-modules/datatable/service/observation-table-column.service';
import { DatasetsComponent } from './datasets/datasets.component';
import { PinkkaComponent } from './pinkka/pinkka.component';
import { BibliographyComponent } from './bibliography/bibliography.component';
import { InsectGuideComponent } from './insect-guide/insect-guide.component';
import { ProtaxComponent } from './protax/protax.component';
import { ProtaxApi } from './protax/protax-api';
import { ProtaxFormComponent } from './protax/protax-form/protax-form.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { GeneticResourceLayoutComponent } from './genetic-resource/layout/genetic-resource-layout.component';
import { GeneticResourceInstructionsComponent } from './genetic-resource/instructions/genetic-resource-instructions.component';
import { BreadcrumbModule } from '../shared-modules/breadcrumb/breadcrumb.module';
import { KerttuClosedComponent } from './kerttu/kerttu-closed.component';
import { DatasetMetadataComponent } from './dataset-metadata/dataset-metadata.component';
import { DatasetMetadataBrowserComponent } from './dataset-metadata/dataset-metadata-browser/dataset-metadata-browser.component';
import { DatasetMetadataViewerComponent } from './dataset-metadata/dataset-metadata-viewer/dataset-metadata-viewer.component';
import { DatasetMetadataViewerItemComponent } from './dataset-metadata/dataset-metadata-viewer/dataset-metadata-viewer-item/dataset-metadata-viewer-item.component'
import { TreeSelectModule } from '../shared-modules/tree-select/tree-select.module';
import { SelectModule } from '../shared-modules/select/select.module';
import { DocumentViewerModule } from '../shared-modules/document-viewer/document-viewer.module';

/* eslint-enable max-len */

@NgModule({
  imports: [
    CommonModule,
    ThemeRoutingModule,
    SharedModule,
    LangModule,
    YkjModule,
    DatatableModule,
    InfoPageModule,
    LajiUiModule,
    ObservationComponentModule,
    BreadcrumbModule,
    TreeSelectModule,
    SelectModule,
    DocumentViewerModule,
  ],
  declarations: [
    HerpetologyComponent,
    ChecklistComponent,
    PinkkaComponent,
    BibliographyComponent,
    InsectGuideComponent,
    IdentifyComponent,
    ThemeComponent,
    QualityComponent,
    MostActiveUsersTableComponent,
    AnnotationTableComponent,
    QualityFiltersComponent,
    GeneticResourceComponent,
    DatasetsComponent,
    ProtaxComponent,
    ProtaxFormComponent,
    NotFoundComponent,
    GeneticResourceLayoutComponent,
    GeneticResourceInstructionsComponent,
    KerttuClosedComponent,
    DatasetMetadataComponent,
    DatasetMetadataBrowserComponent,
    DatasetMetadataViewerComponent,
    DatasetMetadataViewerItemComponent
  ],
  providers: [
    QualityService,
    ProtaxApi,
    {provide: TableColumnService, useClass: ObservationTableColumnService},
  ]
})
export class ThemeModule { }
