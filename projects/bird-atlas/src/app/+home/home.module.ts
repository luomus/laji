import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeComponent } from './home.component';
import { TranslateModule } from '@ngx-translate/core';
import { routing } from './home.routes';
import { SpinnerModule } from 'projects/laji/src/app/shared-modules/spinner/spinner.module';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    routing,
    CommonModule,
    TranslateModule,
    SpinnerModule
  ]
})
export class HomeModule { }
