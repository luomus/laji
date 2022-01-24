/* eslint-disable max-len */
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
import { SubCategoryCheckboxValuePipe } from './sub-category-checkbox-value.pipe';
import { IsEmptyArrayPipe } from './is-empty-array.pipe';
import { LajiUiModule } from 'projects/laji-ui/src/public-api';

/* eslint-enable max-len */

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    InfoModule,
    LajiUiModule
  ],
  providers: [ AdminStatusInfoPipe ] ,
  declarations: [
    MetadataSelectComponent,
    SelectComponent,
    CheckboxComponent,
    AdminStatusInfoPipe,
    MetadataSelectWithSubcategoriesComponent,
    SelectSubcategoriesComponent,
    SubCategoryCheckboxValuePipe,
    IsEmptyArrayPipe
  ],
  exports: [
    MetadataSelectComponent,
    SelectComponent,
    CheckboxComponent,
    AdminStatusInfoPipe,
    MetadataSelectWithSubcategoriesComponent,
    SelectSubcategoriesComponent,
    SubCategoryCheckboxValuePipe,
    IsEmptyArrayPipe
  ]
})
export class SelectModule { }
