import { Injectable, NgModule } from '@angular/core';
import { BrowserModule, HammerGestureConfig, HammerModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import * as Hammer from 'hammerjs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SlideshowComponent } from './slideshow/slideshow.component';
import { SlideComponent } from './slideshow/slide/slide.component';
import { SlideshowFacade } from './slideshow/slideshow.facade';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { SlideNavigationComponent } from './slideshow/slide-navigation/slide-navigation.component';
import { PdfModalComponent } from './slideshow/slide/pdf-modal.component';

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
    HammerModule,
    HttpClientModule,
    ModalModule.forRoot(),
    TranslateModule.forRoot({
      defaultLanguage: 'fi',
      useDefaultLang: true
    })
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
  declarations: [AppComponent, SlideshowComponent, SlideComponent, SlideNavigationComponent, PdfModalComponent]
})
export class AppModule { }
