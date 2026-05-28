import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ThemeRoutingModule } from './theme-routing.module';
import { ThemeComponent } from './theme.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../../../laji/src/app/shared/shared.module';
import { DatasetMetadataModule } from '../../../../laji/src/app/shared-modules/dataset-metadata/dataset-metadata.module';


@NgModule({
  declarations: [ThemeComponent],
  imports: [
    CommonModule,
    ThemeRoutingModule,
    TranslateModule,
    SharedModule,
    DatasetMetadataModule
  ]
})
export class ThemeModule { }
