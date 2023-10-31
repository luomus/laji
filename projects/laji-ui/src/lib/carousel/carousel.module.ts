import { NgModule } from '@angular/core';
import { CarouselComponent } from './carousel.component';
import { CarouselSlideComponent } from './slide/carousel-slide.component';

@NgModule({
  declarations: [
    CarouselComponent,
    CarouselSlideComponent
  ],
  exports: [
    CarouselComponent,
    CarouselSlideComponent
  ]
})
export class CarouselModule {}
