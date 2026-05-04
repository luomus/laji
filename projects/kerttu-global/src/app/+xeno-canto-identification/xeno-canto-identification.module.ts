import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../laji/src/app/shared/shared.module';
import { KerttuGlobalSharedModule } from '../kerttu-global-shared/shared.module';
import { XenoCantoIdentificationComponent } from './xeno-canto-identification.component';
import { LajiUiModule } from '../../../../laji-ui/src/lib/laji-ui.module';
import { InfoPageModule } from '../../../../laji/src/app/shared-modules/info-page/info-page.module';
import { XenoCantoIdentificationRoutingModule } from './xeno-canto-identification-routing.module';
import { DatatableModule } from '../../../../laji/src/app/shared-modules/datatable/datatable.module';
import {
  XenoCantoRecordingIdentificationComponent
} from './xeno-canto-recording-identification/xeno-canto-recording-identification.component';
import {
  XenoCantoExportFormComponent
} from './xeno-canto-export-form/xeno-canto-export-form.component';
import {
  AnnotationBoxTableComponent
} from './annotation-box-table/annotation-box-table.component';
import { IdentificationModule } from '../kerttu-global-shared-modules/identification/identification.module';
import { FilterSpeciesWithBoxesPipe } from './annotation-box-table/filter-species-with-boxes.pipe';
import { SpeciesBoxCountPipe } from './annotation-box-table/species-box-count.pipe';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    KerttuGlobalSharedModule,
    XenoCantoIdentificationRoutingModule,
    LajiUiModule,
    InfoPageModule,
    DatatableModule,
    IdentificationModule
  ],
  declarations: [
    XenoCantoIdentificationComponent,
    XenoCantoRecordingIdentificationComponent,
    XenoCantoExportFormComponent,
    AnnotationBoxTableComponent,
    FilterSpeciesWithBoxesPipe,
    SpeciesBoxCountPipe
  ]
})
export class XenoCantoIdentificationModule { }
