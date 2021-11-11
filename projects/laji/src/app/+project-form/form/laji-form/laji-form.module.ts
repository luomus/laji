import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { LajiFormComponent } from './laji-form/laji-form.component';
import { LajiFormFooterComponent } from './laji-form-footer/laji-form-footer.component';
import { AppComponentModule } from '../../../shared-modules/app-component/app-component.module';
import { InfoPageModule } from '../../../shared-modules/info-page/info-page.module';
import { LajiUiModule } from '../../../../../../laji-ui/src/lib/laji-ui.module';
import { ProjectFormHeaderModule } from '../../header/project-form-header.module';
import { NamedPlaceLinkerButtonModule } from '../named-place-linker/named-place-linker-button/named-place-linker-button.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    AppComponentModule,
    InfoPageModule,
    LajiUiModule,
    ProjectFormHeaderModule,
    NamedPlaceLinkerButtonModule
  ],
  declarations: [LajiFormComponent, LajiFormFooterComponent],
  exports: [LajiFormComponent, LajiFormFooterComponent]
})
export class LajiFormModule { }
