import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LajiUiModule } from '../../../../laji-ui/src/public-api';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../../../laji/src/app/shared/shared.module';
import { NavigationThumbnailModule } from '../../../../laji/src/app/shared-modules/navigation-thumbnail/navigation-thumbnail.module';


@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
    LajiUiModule,
    TranslateModule,
    NavigationThumbnailModule,
    SharedModule
  ]
})
export class HomeModule { }
