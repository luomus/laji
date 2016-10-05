import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CarouselModule } from 'ng2-bootstrap';
import { SharedModule } from '../shared/shared.module';
import { NavigationThumbnailComponent } from '../shared/navigation-thumbnail/navigation-thumbnail.component';
import { HomeComponent, routing, ImageHeaderComponent, StatItemComponent } from './index';
import { TaxonomyApi } from '../shared/api/TaxonomyApi';

@NgModule({
  providers: [TaxonomyApi],
  imports: [routing, SharedModule, RouterModule, CarouselModule],
  declarations: [HomeComponent, ImageHeaderComponent, StatItemComponent, NavigationThumbnailComponent]
})
export class HomeModule {
}
