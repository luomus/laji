import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { ScrollPositionService } from './scroll-position.service';
import { BreadcrumbService } from './breadcrumb.service';
import { LajiApiService } from './api.service';
import { AtlasApiService } from './atlas-api.service';

@NgModule({
  declarations: [],
  providers: [
    ScrollPositionService,
    BreadcrumbService,
    LajiApiService,
    AtlasApiService
  ],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule
  ]
})
export class CoreModule { }