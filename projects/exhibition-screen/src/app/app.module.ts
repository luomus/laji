import { NgModule } from '@angular/core';
import { BrowserModule, HammerModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { SlideshowComponent } from './slideshow/slideshow.component';
import { SlideComponent } from './slideshow/slide/slide.component';
import { SlideshowFacade } from './slideshow/slideshow.facade';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { SlideNavigationComponent } from './slideshow/slide-navigation/slide-navigation.component';
import { PdfModalComponent } from './slideshow/slide/pdf-modal.component';
import { HammerConfig } from './hammer-config';
import { ModalModule } from 'projects/laji-ui/src/lib/modal/modal.module';

@NgModule({ exports: [],
    bootstrap: [AppComponent],
    declarations: [AppComponent, SlideshowComponent, SlideComponent, SlideNavigationComponent, PdfModalComponent], imports: [BrowserModule,
        HammerModule,
        TranslateModule.forRoot({
            defaultLanguage: 'fi',
            useDefaultLang: true
        }),
        ModalModule], providers: [
        {
            provide: HAMMER_GESTURE_CONFIG,
            useClass: HammerConfig
        },
        SlideshowFacade,
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule { }
