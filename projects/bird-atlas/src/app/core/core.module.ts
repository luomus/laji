import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { PopstateService } from './popstate.service';
import { BreadcrumbService } from './breadcrumb.service';
import { AtlasApiService } from './atlas-api.service';
import { FooterService } from './footer.service';

@NgModule({
  declarations: [],
  providers: [
    PopstateService,
    BreadcrumbService,
    AtlasApiService,
    FooterService
  ],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule
  ]
})
export class CoreModule { }
