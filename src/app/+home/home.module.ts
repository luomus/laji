import { NgModule } from '@angular/core';
import { CarouselModule } from 'ngx-bootstrap';
import { SharedModule } from '../shared/shared.module';
import { NavigationThumbnailComponent } from '../shared/navigation-thumbnail/navigation-thumbnail.component';
import { TaxonomyApi } from '../shared/api/TaxonomyApi';
import { routing } from './home.routes';
import { HomeComponent } from './home.components';
import { ImageHeaderComponent } from './image-header/image-header.component';
import { StatItemComponent } from './image-header/stat-item.component';

@NgModule({
  providers: [TaxonomyApi],
  imports: [routing, SharedModule, CarouselModule],
  declarations: [HomeComponent, ImageHeaderComponent, StatItemComponent, NavigationThumbnailComponent]
})
export class HomeModule {
}
