import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { LajiFormComponent } from './laji-form/laji-form.component';
import { DocumentFormComponent } from './document-form/document-form.component';
import { DocumentFormFooterComponent } from './document-form-footer/document-form-footer.component';
import { AppComponentModule } from '../app-component/app-component.module';
import { InfoPageModule } from '../info-page/info-page.module';
import { LajiFormDocumentFacade } from './laji-form-document.facade';
import { LajiUiModule } from '../../../../../laji-ui/src/lib/laji-ui.module';
import { DocumentFormHeaderModule } from './document-form-header/document-form-header.module';
import { NamedPlaceLinkerButtonModule } from '../../+project-form/form/named-place-linker/named-place-linker-button/named-place-linker-button.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    AppComponentModule,
    InfoPageModule,
    LajiUiModule,
    DocumentFormHeaderModule,
    NamedPlaceLinkerButtonModule
  ],
  declarations: [LajiFormComponent, DocumentFormComponent, DocumentFormFooterComponent],
  exports: [LajiFormComponent, DocumentFormComponent, DocumentFormFooterComponent],
  providers: [LajiFormDocumentFacade]
})
export class LajiFormModule { }
