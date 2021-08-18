import { Injectable, NgModule } from '@angular/core';
import { BrowserModule, HammerGestureConfig, HammerModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import * as Hammer from 'hammerjs';
import { SlideshowComponent } from './slideshow/slideshow.component';
import { SlideComponent } from './slideshow/slide/slide.component';
import { SlideshowFacade } from './slideshow/slideshow.facade';

@Injectable()
export class HammerConfig extends HammerGestureConfig {
  overrides = <any> {
    swipe: { direction: Hammer.DIRECTION_ALL },
    pan: { direction: Hammer.DIRECTION_ALL },
  };
}

@NgModule({
  imports: [
    BrowserModule,
    HammerModule
  ],
  exports: [
  ],
  providers: [
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: HammerConfig
    },
    SlideshowFacade
  ],
  bootstrap: [AppComponent],
  declarations: [AppComponent, SlideshowComponent, SlideComponent]
})
export class AppModule { }
