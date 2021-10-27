import { NgModule } from '@angular/core';
import { routing } from './form.routes';
import { FormComponent } from './form.component';
import { DocumentFormComponent } from './document-form/document-form.component';
import { CommonModule } from '@angular/common';
import { SpinnerModule } from '../../shared-modules/spinner/spinner.module';
import { LajiFormModule } from './laji-form/laji-form.module';
import { NamedPlaceModule } from './named-place/named-place.module';
import { TranslateModule } from '@ngx-translate/core';
import { LajiUiModule } from '../../../../../laji-ui/src/lib/laji-ui.module';
import { SharedModule } from '../../shared/shared.module';
import { InfoModule } from '../../shared-modules/info/info.module';
import { SelectModule } from '../../shared-modules/select/select.module';
import { NpEditFormModule } from './named-place/np-edit-form/np-edit-form.module';
import { NamedPlaceLinkerModule } from './named-place-linker/named-place-linker.module';
import { InfoPageModule } from '../../shared-modules/info-page/info-page.module';
import { NamedPlaceLinkerButtonModule } from './named-place-linker/named-place-linker-button/named-place-linker-button.module';
import { OwnSubmissionsModule } from '../../shared-modules/own-submissions/own-submissions.module';
import { ProjectFormHeaderModule } from '../header/project-form-header.module';

@NgModule({
  imports: [
    routing,
    CommonModule,
    SpinnerModule,
    LajiFormModule,
    NamedPlaceModule,
    NpEditFormModule,
    TranslateModule,
    LajiUiModule,
    SharedModule,
    InfoModule,
    SelectModule,
    NamedPlaceLinkerModule,
    InfoPageModule,
    ProjectFormHeaderModule,
    NamedPlaceLinkerButtonModule,
    OwnSubmissionsModule
  ],
  declarations: [
    FormComponent,
    DocumentFormComponent,
  ],
  providers: [
  ]
})
export class FormModule {
}
