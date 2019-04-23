/* tslint:disable:max-line-length */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NafiResultComponent } from './nafi/nafi-result/nafi-result.component';
import { OnlyLoggedIn } from '../shared/route/only-logged-in';
import { HerpetologyComponent } from './herpetology/herpetology.component';
import { DocumentDeActivateGuard } from '../shared/guards/document-de-activate.guard';
import { YkjComponent } from './ykj/ykj.component';
import { EmkComponent } from './emk/emk.component';
import { WbcInstructionsComponent } from './wbc/wbc-instructions/wbc-instructions.component';
import { WbcResultComponent } from './wbc/wbc-result/wbc-result.component';
import { WbcSpeciesComponent } from './wbc/wbc-result/wbc-species/wbc-species.component';
import { WbcSpeciesChartsComponent } from './wbc/wbc-result/wbc-species-charts/wbc-species-charts.component';
import { WbcRoutesComponent } from './wbc/wbc-result/wbc-routes/wbc-routes.component';
import { WbcRouteComponent } from './wbc/wbc-result/wbc-route/wbc-route.component';
import { WbcCensusesComponent } from './wbc/wbc-result/wbc-censuses/wbc-censuses.component';
import { IdentifyComponent } from './identify/identify.component';
import { QualityComponent } from './quality/quality.component';
import { NamedPlaceComponent } from '../shared-modules/named-place/named-place/named-place.component';
import { ThemeComponent } from './theme.component';
import { LineTransectInstructionsComponent } from './line-transect/line-transect-instructions/line-transect-instructions.component';
import { LineTransectResultComponent } from './line-transect/line-transect-result/line-transect-result.component';
import { StatisticsComponent } from '../shared-modules/statistics/statistics.component';
import { NamedPlaceResolver } from 'app/shared-modules/named-place/named-place.resolver';
import { ChecklistComponent } from './checklist/checklist.component';
import { MonitoringThemeBaseComponent } from './common/monitoring-theme-base.component';
import { InstructionsComponent } from './common/instructions/instructions.component';
import { FormComponent } from './common/form/form.component';
import { ThemeOwnSubmissionsComponent } from './common/theme-own-submissions/theme-own-submissions.component';
import { Global } from '../../environments/global';
import { HasFormPermission } from '../shared/route/has-form-permission';
import { NafiTemplatesComponent } from './nafi/nafi-templates/nafi-templates.component';
/* tslint:enable:max-line-length */

const routes: Routes = [
  {path: '',  pathMatch: 'full', component: ThemeComponent, data: {title: 'navigation.theme'}},
  {
    path: 'nafi',
    component: MonitoringThemeBaseComponent,
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'instructions'},
      {path: 'instructions', pathMatch: 'full', component: InstructionsComponent},
      {path: 'stats', pathMatch: 'full', component: NafiResultComponent},
      {path: 'form', pathMatch: 'full', component: FormComponent, canActivate: [OnlyLoggedIn]},
      {
        path: 'form/:id',
        pathMatch: 'full',
        component: FormComponent,
        canActivate: [OnlyLoggedIn],
        canDeactivate: [DocumentDeActivateGuard]
      },
      {path: 'ownSubmissions', pathMatch: 'full', component: ThemeOwnSubmissionsComponent, canActivate: [OnlyLoggedIn]},
      {path: 'templates', pathMatch: 'full', component: NafiTemplatesComponent, canActivate: [OnlyLoggedIn]},
    ],
    data: {
      formID: Global.forms.nafi,
      title: 'NAFI',
      navLinks: {
        templates: {
          routerLink: ['templates'],
          label: 'haseka.templates.title'
        },
        stats: {
          routerLink: ['../nafi', 'stats'],
          label: 'nafi.stats'
        },
      },
      navLinksOrder: ['instructions', 'stats', 'form', 'ownSubmissions', 'templates'],
      instructions: '2668',
    }
  },
  {
    path: 'linjalaskenta',
    component: MonitoringThemeBaseComponent,
    data: {
      formID: Global.forms.lineTransect,
      title: 'lineTransect.title',
      navLinks: {
        'form': {
          label: 'Vakiolinjat ja ilmoittaminen',
          accessLevel: undefined
        },
        'ei-vakiolinjat': {
          routerLink: ['../linjalaskenta', 'ei-vakiolinjat'],
          label: 'Ei-vakiolinjat',
          activeMatch: `/places/${Global.collections.lineTransectEiVakio}`
        },
        'kartoitus': {
          routerLink: ['../linjalaskenta', 'kartoitus'],
          label: 'Kartoituslaskennat',
          activeMatch: `/places/${Global.collections.lineTransectKartoitus}`
        },
        'stats': {
          routerLink: ['../linjalaskenta', 'stats'],
          label: 'Tulokset'
        }
      },
      navLinksOrder: ['instructions', 'stats', 'form', 'ei-vakiolinjat', 'kartoitus', 'ownSubmissions', 'formPermissions'],
      hideNavFor: ['/form']
    },
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'instructions'},
      {path: 'instructions', pathMatch: 'full', component: LineTransectInstructionsComponent, data: { title: 'lineTransect.title' } },
      {
        path: 'form', component: FormComponent,
      },
      {
        path: 'form/:formID', component: FormComponent,
        canActivate: [OnlyLoggedIn]
      },
      {
        path: 'form/:formID/:id', component: FormComponent,
        canActivate: [OnlyLoggedIn],
        canDeactivate: [DocumentDeActivateGuard]
      },
      {
        path: 'places/:collectionId/:formId',
        pathMatch: 'full',
        component: NamedPlaceComponent,
        resolve: { data: NamedPlaceResolver },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        data: { noScrollToTop: true }
      },
      {path: 'ownSubmissions', pathMatch: 'full', component: ThemeOwnSubmissionsComponent, canActivate: [OnlyLoggedIn]},
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
          }
        ]
      },
      {
        path: 'ei-vakiolinjat',
        pathMatch: 'full',
        redirectTo: `places/${Global.collections.lineTransectEiVakio}/${Global.forms.lineTransectEiVakio}`
      },
      {
        path: 'kartoitus',
        pathMatch: 'full',
        redirectTo: `places/${Global.collections.lineTransectKartoitus}/${Global.forms.lineTransectKartoitus}`
      },
      {path: 'statistics/:documentID', pathMatch: 'full', component: StatisticsComponent, canActivate: [OnlyLoggedIn] }
    ]
  },
  {
    path: 'talvilintulaskenta',
    component: MonitoringThemeBaseComponent,
    data: {
      formID: Global.forms.wbc,
      navLinks: {
        stats: {
          routerLink: ['stats'],
          label: 'nafi.stats',
          children: [
            {
              routerLink: ['stats', 'species'],
              label: 'wbc.stats.species'
            },
            {
              routerLink: ['stats', 'routes'],
              label: 'wbc.stats.routes'
            },
            {
              routerLink: ['stats', 'censuses'],
              label: 'wbc.stats.censuses'
            }
          ]
        }
      },
      navLinksOrder: ['instructions', 'stats', 'form', 'ownSubmissions', 'formPermissions']
    },
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'instructions'},
      {path: 'stats', component: WbcResultComponent, data: { title: 'wbc.title', noScrollToTop: true }, children: [
        {path: '', pathMatch: 'full', redirectTo: 'species'},
        {path: 'species', component: WbcSpeciesComponent},
        {path: 'species/:id', component: WbcSpeciesChartsComponent},
        {path: 'routes', pathMatch: 'full', component: WbcRoutesComponent},
        {path: 'routes/:id', pathMatch: 'full', component: WbcRouteComponent},
        {path: 'censuses', pathMatch: 'full', component: WbcCensusesComponent},
      ]},
      {path: 'form', pathMatch: 'full', component: FormComponent},
      {
        path: 'form/:id',
        pathMatch: 'full',
        component: FormComponent,
        canActivate: [OnlyLoggedIn],
        canDeactivate: [DocumentDeActivateGuard]
      },
      {path: 'ownSubmissions', pathMatch: 'full', component: ThemeOwnSubmissionsComponent, canActivate: [OnlyLoggedIn]},
      {path: 'instructions', pathMatch: 'full', component: WbcInstructionsComponent, data: { title: 'wbc.title' } },
      {
        path: 'places/:collectionId/:formId',
        pathMatch: 'full',
        component: NamedPlaceComponent,
        resolve: { data: NamedPlaceResolver },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        data: { noScrollToTop: true }
      },
      {path: 'stats', component: WbcResultComponent, data: { title: 'wbc.title', noScrollToTop: true }, children: [
          {path: '', pathMatch: 'full', redirectTo: 'species'},
          {path: 'species', component: WbcSpeciesComponent},
          {path: 'species/:id', component: WbcSpeciesChartsComponent},
          {path: 'routes', pathMatch: 'full', component: WbcRoutesComponent},
          {path: 'routes/:id', pathMatch: 'full', component: WbcRouteComponent},
          {path: 'censuses', pathMatch: 'full', component: WbcCensusesComponent},
      ]},
    ]
  },
  {
    path: 'vieraslajit',
    component: MonitoringThemeBaseComponent,
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'instructions'},
      {path: 'instructions', pathMatch: 'full', component: InstructionsComponent},
      {
        path: 'places',
        pathMatch: 'full',
        redirectTo: 'form',
      },
      {
        path: 'form',
        pathMatch: 'full',
        component: FormComponent,
        canActivate: [OnlyLoggedIn, HasFormPermission],
      },
      {
        path: 'form/:id',
        pathMatch: 'full',
        component: FormComponent,
        canActivate: [OnlyLoggedIn, HasFormPermission],
        canDeactivate: [DocumentDeActivateGuard],
      },
      {
        path: 'places/:collectionId/:formId',
        pathMatch: 'full',
        component: NamedPlaceComponent,
        resolve: { data: NamedPlaceResolver },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        canActivate: [OnlyLoggedIn, HasFormPermission],
      },
      {
        path: 'ownSubmissions',
        pathMatch: 'full',
        component: ThemeOwnSubmissionsComponent,
        canActivate: [OnlyLoggedIn, HasFormPermission],
      }
    ],
    data: {
      formID: Global.forms.invasiveControl,
      noFormPermissionRedirect: '/theme/vieraslajit',
      title: 'Vieras&shy;lajit',
      instructions: '2661',
      navLinks: {
        form: {
          label: 'invasiveSpecies.places'
        }
      }
    }
  },
  {
    path: 'kunnat',
    component: MonitoringThemeBaseComponent,
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'instructions'},
      {path: 'instructions', pathMatch: 'full', component: InstructionsComponent},
      {
        path: 'places',
        pathMatch: 'full',
        redirectTo: 'form',
      },
      {
        path: 'form',
        pathMatch: 'full',
        component: FormComponent,
        canActivate: [OnlyLoggedIn, HasFormPermission],
      },
      {
        path: 'form/:id',
        pathMatch: 'full',
        component: FormComponent,
        canActivate: [OnlyLoggedIn, HasFormPermission],
        canDeactivate: [DocumentDeActivateGuard],
      },
      {
        path: 'places/:collectionId/:formId',
        pathMatch: 'full',
        component: NamedPlaceComponent,
        resolve: { data: NamedPlaceResolver },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        canActivate: [OnlyLoggedIn, HasFormPermission],
      },
      {
        path: 'ownSubmissions',
        pathMatch: 'full',
        component: ThemeOwnSubmissionsComponent,
        canActivate: [OnlyLoggedIn, HasFormPermission],
      }
    ],
    data: {
      formID: Global.forms.municipalityMonitoringForm,
      noFormPermissionRedirect: '/theme/kunnat',
      title: 'Kuntalomake',
      instructions: '2666',
      navLinks: {
        form: {
          label: 'invasiveSpecies.places'
        }
      }
    }
  },
  {
    path: 'lolife',
    component: MonitoringThemeBaseComponent,
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'instructions'},
      {path: 'instructions', pathMatch: 'full', component: InstructionsComponent},
      {
        path: 'places',
        redirectTo: 'form',
      },
      {
        path: 'form',
        pathMatch: 'full',
        component: FormComponent,
        canActivate: [OnlyLoggedIn, HasFormPermission],
      },
      {
        path: 'form/:id',
        pathMatch: 'full',
        component: FormComponent,
        canActivate: [OnlyLoggedIn, HasFormPermission],
        canDeactivate: [DocumentDeActivateGuard],
      },
      {
        path: 'places/:collectionId/:formId',
        pathMatch: 'full',
        component: NamedPlaceComponent,
        resolve: { data: NamedPlaceResolver },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        canActivate: [OnlyLoggedIn, HasFormPermission],
      },
      {
        path: 'ownSubmissions',
        pathMatch: 'full',
        component: ThemeOwnSubmissionsComponent,
        canActivate: [OnlyLoggedIn, HasFormPermission],
      }
    ],
    data: {
      formID: Global.forms.lolifeForm,
      noFormPermissionRedirect: '/theme/lolife',
      title: 'LOLIFE',
    }
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
