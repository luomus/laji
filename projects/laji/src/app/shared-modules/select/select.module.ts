/* tslint:disable:max-line-length */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { MetadataSelectComponent } from './metadata-select/metadata-select.component';
import { SelectComponent } from './select/select.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { InfoModule } from '../info/info.module';
import { AdminStatusInfoPipe } from './admin-status-info.pipe';
import { MetadataSelectWithSubcategoriesComponent } from './metadata-select-with-subcategories/metadata-select-with-subcategories.component';
import { SelectSubcategoriesComponent } from './select-subcategories/select-subcategories.component';
import { ExcludeSubcategoryPipe } from './exclude-subcategory.pipe';

/* tslint:enable:max-line-length */

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    InfoModule
  ],
  providers: [ AdminStatusInfoPipe, ExcludeSubcategoryPipe ] ,
  declarations: [
    MetadataSelectComponent,
    SelectComponent,
    CheckboxComponent,
    AdminStatusInfoPipe,
    MetadataSelectWithSubcategoriesComponent,
    SelectSubcategoriesComponent,
    ExcludeSubcategoryPipe
  ],
  exports: [
    MetadataSelectComponent,
    SelectComponent,
    CheckboxComponent,
    AdminStatusInfoPipe,
    MetadataSelectWithSubcategoriesComponent,
    SelectSubcategoriesComponent,
    ExcludeSubcategoryPipe
  ]
})
export class SelectModule { }
