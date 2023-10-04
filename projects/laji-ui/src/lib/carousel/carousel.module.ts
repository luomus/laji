import { NgModule } from '@angular/core';
import { CarouselComponent } from './carousel.component';
import { SlideComponent } from './slide/slide.component';

@NgModule({
  declarations: [
    CarouselComponent,
    SlideComponent
  ],
  exports: [
    CarouselComponent,
    SlideComponent
  ]
})
export class CarouselModule {}
