import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AboutRoutingModule } from './about-routing.module';
import { AboutComponent } from './about.component';
import { InfoPageModule } from '../../../../laji/src/app/shared-modules/info-page/info-page.module';
import { SharedModule } from '../../../../laji/src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    AboutRoutingModule,
    SharedModule,
    InfoPageModule
  ],
  declarations: [AboutComponent]
})
export class AboutModule { }
