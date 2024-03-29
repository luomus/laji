import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../laji/src/app/shared/shared.module';
import { JwBootstrapSwitchNg2Module } from '@servoy/jw-bootstrap-switch-ng2';
import { SpeciesListFiltersComponent } from './component/species-list-filters/species-list-filters.component';
import { SearchInputComponent } from './component/species-list-filters/search-input/search-input.component';
import { UserNameTemplateComponent } from './component/user-name-template.component';
import { SpeciesNamePipe } from './pipe/species-name.pipe';
import { SpeciesNameComponent } from './component/species-name.component';
import { FileNamePipe } from './pipe/file-name.pipe';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    JwBootstrapSwitchNg2Module
  ],
  declarations: [
    SpeciesListFiltersComponent,
    SearchInputComponent,
    UserNameTemplateComponent,
    SpeciesNamePipe,
    SpeciesNameComponent,
    FileNamePipe
  ],
  exports: [
    SpeciesListFiltersComponent,
    SearchInputComponent,
    UserNameTemplateComponent,
    SpeciesNamePipe,
    SpeciesNameComponent,
    FileNamePipe
  ]
})
export class KerttuGlobalSharedModule { }
