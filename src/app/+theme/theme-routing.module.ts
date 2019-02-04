/* tslint:disable:max-line-length */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NafiComponent } from './nafi/nafi.component';
import { NafiResultComponent } from './nafi/nafi-result/nafi-result.component';
import { NafiFormComponent } from './nafi/nafi-form/nafi-form.component';
import { OnlyLoggedIn } from '../shared/route/only-logged-in';
import { NafiMyDocumentListComponent } from './nafi/nafi-my-document-list/nafi-my-document-list.component';
import { NafiInstructionsComponent } from './nafi/nafi-instructions/nafi-instructions.component';
import { HerpetologyComponent } from './herpetology/herpetology.component';
import { DocumentDeActivateGuard } from '../shared/guards/document-de-activate.guard';
import { YkjComponent } from './ykj/ykj.component';
import { EmkComponent } from './emk/emk.component';
import { WbcComponent } from './wbc/wbc.component';
import { WbcInstructionsComponent } from './wbc/wbc-instructions/wbc-instructions.component';
import { WbcResultComponent } from './wbc/wbc-result/wbc-result.component';
import { WbcSpeciesComponent } from './wbc/wbc-result/wbc-species/wbc-species.component';
import { WbcSpeciesChartsComponent } from './wbc/wbc-result/wbc-species-charts/wbc-species-charts.component';
import { WbcRoutesComponent } from './wbc/wbc-result/wbc-routes/wbc-routes.component';
import { WbcRouteComponent } from './wbc/wbc-result/wbc-route/wbc-route.component';
import { WbcCensusesComponent } from './wbc/wbc-result/wbc-censuses/wbc-censuses.component';
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
import { LineTransectFormEiVakioComponent } from './line-transect/line-transect-form-ei-vakio/line-transect-form-ei-vakio.component';
import { LineTransectFormKartoitusComponent } from './line-transect/line-transect-form-kartoitus/line-transect-form-kartoitus.component';
import { InvasiveControlFormComponent } from './invasive-control/invasive-control-form/invasive-control-form.component';
import { InvasiveControlContainerComponent } from './invasive-control/invasive-control.container';
import { InvasiveControlInstructionsContainerComponent } from './invasive-control/invasive-control-instructions/invasive-control-instructions.container';
import { MunicipalityMonitoringFormComponent } from './municipality-monitoring/municipality-monitoring-form/municipality-monitoring-form.component';
import { MunicipalityMonitoringInstructionsContainerComponent } from './municipality-monitoring/municipality-monitoring-instructions/municipality-monitoring-instructions.container';
import { MunicipalityMonitoringContainerComponent } from './municipality-monitoring/municipality-monitoring.container';
import { NamedPlaceResolver } from 'app/shared-modules/named-place/named-place.resolver';
import { ChecklistComponent } from './checklist/checklist.component';
import { HasFormPermission } from '../shared/route/has-form-permission';
/* tslint:enable:max-line-length */

const routes: Routes = [
  {path: '',  pathMatch: 'full', component: ThemeComponent, data: {title: 'navigation.theme'}},
  {
    path: 'talvilintulaskenta',
    component: WbcComponent,
    children: [
      {path: '', pathMatch: 'full', component: WbcInstructionsComponent, data: { title: 'wbc.title' }},
      {path: 'stats', component: WbcResultComponent, data: { title: 'wbc.title', noScrollToTop: true }, children: [
        {path: '', pathMatch: 'full', redirectTo: 'species'},
        {path: 'species', component: WbcSpeciesComponent},
        {path: 'species/:id', component: WbcSpeciesChartsComponent},
        {path: 'routes', pathMatch: 'full', component: WbcRoutesComponent},
        {path: 'routes/:id', pathMatch: 'full', component: WbcRouteComponent},
        {path: 'censuses', pathMatch: 'full', component: WbcCensusesComponent},
      ]},
      {path: 'form', pathMatch: 'full', component: WbcFormComponent},
      {
        path: 'form/:id',
        pathMatch: 'full',
        component: WbcFormComponent,
        canActivate: [OnlyLoggedIn],
        canDeactivate: [DocumentDeActivateGuard]
      },
      {path: 'ownSubmissions', pathMatch: 'full', component: WbcOwnSubmissionsComponent, canActivate: [OnlyLoggedIn]},
      {path: 'instructions', pathMatch: 'full', component: WbcInstructionsComponent, data: { title: 'wbc.title' } },
      {
        path: 'places/:collectionId/:formId',
        pathMatch: 'full',
        component: NamedPlaceComponent,
        resolve: { data: NamedPlaceResolver },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        data: { noScrollToTop: true }
      }
    ]
  },
  {
    path: 'nafi',
    component: NafiComponent,
    children: [
      {path: '', pathMatch: 'full', component: NafiInstructionsComponent, data: { title: 'nafi.stats.title' }},
      {path: 'stats', pathMatch: 'full', component: NafiResultComponent, data: { title: 'nafi.stats.title', noScrollToTop: true}},
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
      {
        path: 'stats',
        data: { noScrollToTop: true },
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'chart'
          },
          {
            path: ':tab',
            pathMatch: 'full',
            component: LineTransectResultComponent,
            data: { title: 'lineTransect.title' }
          }
        ]
      },
      {path: 'form', pathMatch: 'full', component: LineTransectFormComponent},
      {
        path: 'form/:id',
        pathMatch: 'full',
        component: LineTransectFormComponent,
        canActivate: [OnlyLoggedIn],
        canDeactivate: [DocumentDeActivateGuard]
      },
      {path: 'ei-vakiolinjat', pathMatch: 'full', component: LineTransectFormEiVakioComponent},
      {
        path: 'ei-vakiolinjat/:id',
        pathMatch: 'full',
        component: LineTransectFormEiVakioComponent,
        canActivate: [OnlyLoggedIn],
        canDeactivate: [DocumentDeActivateGuard]
      },
      {path: 'kartoitus', pathMatch: 'full', component: LineTransectFormKartoitusComponent},
      {
        path: 'kartoitus/:id',
        pathMatch: 'full',
        component: LineTransectFormKartoitusComponent,
        canActivate: [OnlyLoggedIn],
        canDeactivate: [DocumentDeActivateGuard]
      },
      {path: 'ownSubmissions', pathMatch: 'full', component: LineTransectMyDocumentListComponent, canActivate: [OnlyLoggedIn]},
      {path: 'instructions', pathMatch: 'full', component: LineTransectInstructionsComponent, data: { title: 'lineTransect.title' } },
      {
        path: 'places/:collectionId/:formId',
        pathMatch: 'full',
        component: NamedPlaceComponent,
        resolve: { data: NamedPlaceResolver },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        data: { noScrollToTop: true }
      },
      {path: 'statistics/:documentID', pathMatch: 'full', component: StatisticsComponent, canActivate: [OnlyLoggedIn] }
    ]
  },
  {
    path: 'vieraslajit',
    component: InvasiveControlContainerComponent,
    children: [
      {path: '', pathMatch: 'full', component: InvasiveControlInstructionsContainerComponent},
      {
        path: 'instructions',
        pathMatch: 'full',
        component: InvasiveControlInstructionsContainerComponent
      },
      {
        path: 'places',
        pathMatch: 'full',
        component: InvasiveControlFormComponent,
        canActivate: [OnlyLoggedIn, HasFormPermission],
        data: {formId: 'MHL.33'}
      },
      {
        path: 'form',
        pathMatch: 'full',
        component: InvasiveControlFormComponent,
        canActivate: [OnlyLoggedIn, HasFormPermission],
        data: {formId: 'MHL.33', noFormPermissionRedirect: '/theme/vieraslajit'}
      },
      {
        path: 'form/:id',
        pathMatch: 'full',
        component: InvasiveControlFormComponent,
        canActivate: [OnlyLoggedIn, HasFormPermission],
        canDeactivate: [DocumentDeActivateGuard],
        data: {formId: 'MHL.33', noFormPermissionRedirect: '/theme/vieraslajit'}
      },
      {
        path: 'places/:collectionId/:formId',
        pathMatch: 'full',
        component: NamedPlaceComponent,
        resolve: { data: NamedPlaceResolver },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        canActivate: [OnlyLoggedIn, HasFormPermission],
        data: { noScrollToTop: true, formId: 'MHL.33', noFormPermissionRedirect: '/theme/vieraslajit'}
      }
    ]
  },
  {
    path: 'kunnat',
    component: MunicipalityMonitoringContainerComponent,
    children: [
      {path: '', pathMatch: 'full', component: MunicipalityMonitoringInstructionsContainerComponent},
      {
        path: 'instructions',
        pathMatch: 'full',
        component: MunicipalityMonitoringInstructionsContainerComponent
      },
      {
        path: 'places',
        pathMatch: 'full',
        component: MunicipalityMonitoringFormComponent,
        canActivate: [OnlyLoggedIn, HasFormPermission],
        data: {formId: 'MHL.35', noFormPermissionRedirect: '/theme/kunnat'}
      },
      {
        path: 'form',
        pathMatch: 'full',
        component: MunicipalityMonitoringFormComponent,
        canActivate: [OnlyLoggedIn, HasFormPermission],
        data: {formId: 'MHL.35', noFormPermissionRedirect: '/theme/kunnat'}
      },
      {
        path: 'form/:id',
        pathMatch: 'full',
        component: MunicipalityMonitoringFormComponent,
        canActivate: [OnlyLoggedIn, HasFormPermission],
        canDeactivate: [DocumentDeActivateGuard],
        data: {formId: 'MHL.35', noFormPermissionRedirect: '/theme/kunnat'}
      },
      {
        path: 'places/:collectionId/:formId',
        pathMatch: 'full',
        component: NamedPlaceComponent,
        resolve: { data: NamedPlaceResolver },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        canActivate: [OnlyLoggedIn, HasFormPermission],
        data: { noScrollToTop: true, formId: 'MHL.35', noFormPermissionRedirect: '/theme/kunnat' }
      }
    ]
  },
  {path: 'herpetology',  pathMatch: 'full', component: HerpetologyComponent, data: {title: 'navigation.herpetology'}},
  {path: 'identify',  pathMatch: 'full', component: IdentifyComponent, data: {title: 'navigation.identify'}},
  {path: 'quality',  pathMatch: 'full', component: QualityComponent, data: {title: 'navigation.quality'}},
  {path: 'ykj',  pathMatch: 'full', component: YkjComponent, data: {title: 'navigation.ykj'}},
  {path: 'emk',  pathMatch: 'full', component: EmkComponent, data: {title: 'Eliömaakunnat'}},
  {path: 'checklist',  pathMatch: 'full', component: ChecklistComponent, data: {title: 'navigation.checklist'}}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [NamedPlaceResolver]
})
export class ThemeRoutingModule { }
