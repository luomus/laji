import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { NavbarComponent } from '../../shared/navbar';
import { FooterComponent } from '../../shared/footer/footer.component';
import { FeedbackComponent } from '../../shared/feedback/feedback.component';
import { ForumComponent } from '../../forum/forum.component';
import { LocaleEnComponent } from '../../locale/locale-en.component';
import { LocaleFiComponent } from '../../locale/locale-fi.component';
import { LocaleSvComponent } from '../../locale/locale-sv.component';
import { SharedModule } from '../../shared/shared.module';
import { IucnFooterComponent } from '../../shared/iucn-footer/footer.component';
import { LangModule } from '../lang/lang.module';
import { DocumentViewerModule } from '../document-viewer/document-viewer.module';
import { LajiUiModule } from '../../../../../laji-ui/src/lib/laji-ui.module';
import { BetaPopupComponent } from './beta-popup/beta-popup.component';

@NgModule({
  declarations: [
    NavbarComponent,
    FooterComponent,
    IucnFooterComponent,
    FeedbackComponent,
    ForumComponent,
    LocaleEnComponent,
    LocaleFiComponent,
    LocaleSvComponent,
    AppComponent,
    BetaPopupComponent
  ],
  imports: [
    LangModule,
    CommonModule,
    SharedModule,
    DocumentViewerModule,
    LajiUiModule
  ],
  exports: [
    NavbarComponent,
    FooterComponent,
    IucnFooterComponent,
    FeedbackComponent,
    ForumComponent,
    LocaleEnComponent,
    LocaleFiComponent,
    LocaleSvComponent,
    AppComponent
  ]
})
export class AppComponentModule { }
