import { NgModule } from '@angular/core';
import { BrowserModule, HammerModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { SlideshowComponent } from './slideshow/slideshow.component';
import { SlideComponent } from './slideshow/slide/slide.component';
import { SlideshowFacade } from './slideshow/slideshow.facade';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { SlideNavigationComponent } from './slideshow/slide-navigation/slide-navigation.component';
import { PdfModalComponent } from './slideshow/slide/pdf-modal.component';
import { HammerConfig } from './hammer-config';
import { ModalModule } from 'projects/laji-ui/src/lib/modal/modal.module';

@NgModule({
  imports: [
    BrowserModule,
    HammerModule,
    HttpClientModule,
    TranslateModule.forRoot({
      defaultLanguage: 'fi',
      useDefaultLang: true
    }),
    ModalModule
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
