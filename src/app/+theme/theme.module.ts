import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ThemeRoutingModule } from './theme-routing.module';
import { NafiComponent } from './nafi/nafi.component';
import { HerpetologyComponent } from './herpetology/herpetology.component';
import { SharedModule } from '../shared/shared.module';
import { ThemeResultComponent } from './theme-result/theme-result.component';
import { NafiResultComponent } from './nafi/nafi-result/nafi-result.component';
import { ResultService } from './service/result.service';
import { FixedTableDirective } from './directive/fixed-table.directive';
import { ThemeObservationListComponent } from './theme-observation-list/theme-observation-list.component';
import { NafiFormComponent } from './nafi/nafi-form/nafi-form.component';
import { NafiMyDocumentListComponent } from './nafi/nafi-my-document-list/nafi-my-document-list.component';
import { ThemeMyDocumentListComponent } from './theme-my-document-list/theme-my-document-list.component';
import { NafiInstructionsComponent } from './nafi/nafi-instructions/nafi-instructions.component';
import { ViewerModule } from '../+viewer/viewer.module';
import { YkjComponent } from './ykj/ykj.component';
import { EmkComponent } from './emk/emk.component';
import { WbcComponent } from './wbc/wbc.component';
import { WbcFormComponent } from './wbc/wbc-form/wbc-form.component';
import { WbcResultComponent } from './wbc/wbc-result/wbc-result.component';
import { WbcInstructionsComponent } from './wbc/wbc-instructions/wbc-instructions.component';
import { LangModule } from '../shared-modules/lang/lang.module';
import { YkjModule } from '../shared-modules/ykj/ykj.module';
import { ObservationResultModule } from '../shared-modules/observation-result/observation-result.module';
import { OwnSubmissionsModule } from '../shared-modules/own-submissions/own-submissions.module';
import { WbcOwnSubmissionsComponent } from './wbc/wbc-own-submissions/wbc-own-submissions.component';
import { IdentifyComponent } from './identify/identify.component';

@NgModule({
  imports: [
    CommonModule,
    ThemeRoutingModule,
    SharedModule,
    ViewerModule,
    LangModule,
    YkjModule,
    ObservationResultModule,
    OwnSubmissionsModule
  ],
  declarations: [
    NafiComponent,
    HerpetologyComponent,
    ThemeResultComponent,
    NafiResultComponent,
    FixedTableDirective,
    ThemeObservationListComponent,
    NafiFormComponent,
    NafiMyDocumentListComponent,
    ThemeMyDocumentListComponent,
    NafiInstructionsComponent,
    YkjComponent,
    EmkComponent,
    WbcComponent,
    WbcFormComponent,
    WbcResultComponent,
    WbcInstructionsComponent,
    WbcOwnSubmissionsComponent,
    IdentifyComponent
  ],
  providers: [ ResultService ]
})
export class ThemeModule { }
