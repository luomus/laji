import { NgModule } from '@angular/core';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { SharedModule } from '../shared/shared.module';
import { routing } from './home.routes';
import { HomeComponent } from './home.components';
import { ImageHeaderComponent } from './image-header/image-header.component';
import { StatItemComponent } from './image-header/stat-item.component';
import { ObservationMapModule } from '../shared-modules/observation-map/observation-map.module';
import { NavigationThumbnailModule } from '../shared-modules/navigation-thumbnail/navigation-thumbnail.module';
import { TechnicalNewsModule } from '../shared-modules/technical-news/technical-news.module';
import { InfoModule } from '../shared-modules/info/info.module';
import { LajiUiModule } from 'projects/laji-ui/src/public-api';
import { InfoPageModule } from '../shared-modules/info-page/info-page.module';
import { TwitterFeedComponent } from './twitter-feed/twitter-feed.component';
import { FacebookFeedComponent } from './facebook-feed/facebook-feed.component';


@NgModule({
  imports: [routing, SharedModule, CarouselModule, ObservationMapModule, NavigationThumbnailModule, TechnicalNewsModule, InfoModule, LajiUiModule, InfoPageModule],
  declarations: [HomeComponent, ImageHeaderComponent, StatItemComponent, TwitterFeedComponent, FacebookFeedComponent]
})
export class HomeModule {
}
