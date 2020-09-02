/* tslint:disable:max-line-length */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { MetadataSelectComponent } from './metadata-select/metadata-select.component';
import { SelectComponent } from './select/select.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { InfoModule } from '../info/info.module';

/* tslint:enable:max-line-length */

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    InfoModule
  ],
  declarations: [
    MetadataSelectComponent,
    SelectComponent,
    CheckboxComponent
  ],
  exports: [
    MetadataSelectComponent,
    SelectComponent,
    CheckboxComponent
  ]
})
export class SelectModule { }
