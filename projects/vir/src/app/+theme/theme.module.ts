import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ThemeRoutingModule } from './theme-routing.module';
import { ThemeComponent } from './theme.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../../../../src/app/shared/shared.module';


@NgModule({
  declarations: [ThemeComponent],
  imports: [
    CommonModule,
    ThemeRoutingModule,
    TranslateModule,
    SharedModule
  ]
})
export class ThemeModule { }
