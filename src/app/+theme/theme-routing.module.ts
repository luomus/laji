import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NafiComponent } from './nafi/nafi.component';
import { NafiResultComponent } from './nafi/nafi-result/nafi-result.component';
import { NafiFormComponent } from './nafi/nafi-form/nafi-form.component';
import { OnlyLoggedIn } from '../shared/route/only-logged-in';
import { NafiMyDocumentListComponent } from './nafi/nafi-my-document-list/nafi-my-document-list.component';
import { NafiInstructionsComponent } from './nafi/nafi-instructions/nafi-instructions.component';
import { HerpetologyComponent } from './herpetology/herpetology.component';
import { DocumentDeActivateGuard } from '../shared/document-form/document-de-activate.guard';
import { YkjComponent } from './ykj/ykj.component';
import { EmkComponent } from './emk/emk.component';
import { WbcComponent } from './wbc/wbc.component';
import { WbcInstructionsComponent } from './wbc/wbc-instructions/wbc-instructions.component';
import { WbcResultComponent } from './wbc/wbc-result/wbc-result.component';
import { WbcFormComponent } from './wbc/wbc-form/wbc-form.component';
import { WbcOwnSubmissionsComponent } from './wbc/wbc-own-submissions/wbc-own-submissions.component';
import { IdentifyComponent } from './identify/identify.component';
import { QualityComponent } from './quality/quality.component';
import { NafiTemplatesComponent } from './nafi/nafi-templates/nafi-templates.component';
import { NamedPlaceComponent } from '../shared-modules/named-place/named-place/named-place.component';
import { ThemeComponent } from './theme.component';
import { LineTransectComponent } from './line-transect/line-transect.component';
import { LineTransectInstructionsComponent } from './line-transect/line-transect-instructions/line-transect-instructions.component';
import { LineTransectResultComponent } from './line-transect/line-transect-result/line-transect-result.component';
import { LineTransectFormComponent } from './line-transect/line-transect-form/line-transect-form.component';
import { LineTransectMyDocumentListComponent } from './line-transect/line-transect-my-document-list/line-transect-my-document-list.component';
import { StatisticsComponent } from '../shared-modules/statistics/statistics.component';

const routes: Routes = [
  {path: '',  pathMatch: 'full', component: ThemeComponent, data: {title: 'navigation.theme'}},
  {
    path: 'talvilintulaskenta',
    component: WbcComponent,
    children: [
      {path: '', pathMatch: 'full', component: WbcInstructionsComponent, data: { title: 'wbc.title' }},
      {path: 'stats', pathMatch: 'full', component: WbcResultComponent, data: { title: 'wbc.title' }},
      {path: 'form', pathMatch: 'full', component: WbcFormComponent, canActivate: [OnlyLoggedIn]},
      {
        path: 'form/:id',
        pathMatch: 'full',
        component: WbcFormComponent,
        canActivate: [OnlyLoggedIn],
        canDeactivate: [DocumentDeActivateGuard]
      },
      {path: 'ownSubmissions', pathMatch: 'full', component: WbcOwnSubmissionsComponent, canActivate: [OnlyLoggedIn]},
      {path: 'instructions', pathMatch: 'full', component: WbcInstructionsComponent, data: { title: 'wbc.title' } },
      {path: 'places/:collectionId/:formId', pathMatch: 'full', component: NamedPlaceComponent }
    ]
  },
  {
    path: 'nafi',
    component: NafiComponent,
    children: [
      {path: '', pathMatch: 'full', component: NafiInstructionsComponent, data: { title: 'nafi.stats.title' }},
      {path: 'stats', pathMatch: 'full', component: NafiResultComponent, data: { title: 'nafi.stats.title' }},
      {path: 'form', pathMatch: 'full', component: NafiFormComponent, canActivate: [OnlyLoggedIn]},
      {
        path: 'form/:id',
        pathMatch: 'full',
        component: NafiFormComponent,
        canActivate: [OnlyLoggedIn],
        canDeactivate: [DocumentDeActivateGuard]
      },
      {path: 'ownSubmissions', pathMatch: 'full', component: NafiMyDocumentListComponent, canActivate: [OnlyLoggedIn]},
      {path: 'templates', pathMatch: 'full', component: NafiTemplatesComponent, canActivate: [OnlyLoggedIn]},
      {path: 'instructions', pathMatch: 'full', component: NafiInstructionsComponent, data: { title: 'nafi.stats.title' } }
    ]
  },
  {
    path: 'linjalaskenta',
    component: LineTransectComponent,
    children: [
      {path: '', pathMatch: 'full', component: LineTransectInstructionsComponent, data: { title: 'lineTransect.title' }},
      {path: 'stats', pathMatch: 'full', component: LineTransectResultComponent, data: { title: 'lineTransect.title' }},
      {path: 'form', pathMatch: 'full', component: LineTransectFormComponent},
      {
        path: 'form/:id',
        pathMatch: 'full',
        component: LineTransectFormComponent,
        canActivate: [OnlyLoggedIn],
        canDeactivate: [DocumentDeActivateGuard]
      },
      {path: 'ownSubmissions', pathMatch: 'full', component: LineTransectMyDocumentListComponent, canActivate: [OnlyLoggedIn]},
      {path: 'instructions', pathMatch: 'full', component: LineTransectInstructionsComponent, data: { title: 'lineTransect.title' } },
      {path: 'places/:collectionId/:formId', pathMatch: 'full', component: NamedPlaceComponent },
      {path: 'statistics/:documentID', pathMatch: 'full', component: StatisticsComponent }
    ]
  },
  {path: 'herpetology',  pathMatch: 'full', component: HerpetologyComponent, data: {title: 'navigation.herpetology'}},
  {path: 'identify',  pathMatch: 'full', component: IdentifyComponent, data: {title: 'navigation.identify'}},
  {path: 'quality',  pathMatch: 'full', component: QualityComponent, data: {title: 'navigation.quality'}},
  {path: 'ykj',  pathMatch: 'full', component: YkjComponent, data: {title: 'navigation.ykj'}},
  {path: 'emk',  pathMatch: 'full', component: EmkComponent, data: {title: 'Eliömaakunnat'}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class ThemeRoutingModule { }
