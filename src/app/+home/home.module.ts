import { NgModule } from '@angular/core';
import { CarouselModule } from 'ngx-bootstrap';
import { SharedModule } from '../shared/shared.module';
import { routing } from './home.routes';
import { HomeComponent } from './home.components';
import { ImageHeaderComponent } from './image-header/image-header.component';
import { StatItemComponent } from './image-header/stat-item.component';
import { ObservationMapModule } from '../shared-modules/observation-map/observation-map.module';

@NgModule({
  imports: [routing, SharedModule, CarouselModule, ObservationMapModule],
  declarations: [HomeComponent, ImageHeaderComponent, StatItemComponent]
})
export class HomeModule {
}
