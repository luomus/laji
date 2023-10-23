import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { FeedbackComponent } from '../../shared/feedback/feedback.component';
import { ForumComponent } from '../../forum/forum.component';
import { SharedModule } from '../../shared/shared.module';
import { IucnFooterComponent } from '../../shared/iucn-footer/footer.component';
import { LangModule } from '../lang/lang.module';
import { DocumentViewerModule } from '../document-viewer/document-viewer.module';
import { LajiUiModule } from '../../../../../laji-ui/src/lib/laji-ui.module';
import { BetaPopupComponent } from './beta-popup/beta-popup.component';
import { DropdownModule } from 'projects/laji-ui/src/lib/dropdown/dropdown.module';
import { NavbarModule } from '../navbar/navbar.module';

@NgModule({
  declarations: [
    FooterComponent,
    IucnFooterComponent,
    FeedbackComponent,
    ForumComponent,
    AppComponent,
    BetaPopupComponent
  ],
  imports: [
    LangModule,
    CommonModule,
    SharedModule,
    DocumentViewerModule,
    LajiUiModule,
    DropdownModule,
    NavbarModule
  ],
  exports: [
    FooterComponent,
    IucnFooterComponent,
    FeedbackComponent,
    ForumComponent,
    AppComponent
  ]
})
export class AppComponentModule { }
