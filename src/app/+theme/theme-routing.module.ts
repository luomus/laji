/* tslint:disable:max-line-length */
import { NgModule } from '@angular/core';
import {Route, RouterModule, Routes} from '@angular/router';
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
import merge from 'deepmerge';
import { ThemeFormService } from './common/theme-form.service';
/* tslint:enable:max-line-length */


const routes: Routes = [
  {path: '',  pathMatch: 'full', component: ThemeComponent, data: {title: 'navigation.theme'}},
  {path: 'herpetology',  pathMatch: 'full', component: HerpetologyComponent, data: {title: 'navigation.herpetology'}},
  {path: 'identify',  pathMatch: 'full', component: IdentifyComponent, data: {title: 'navigation.identify'}},
  {path: 'quality',  pathMatch: 'full', component: QualityComponent, data: {title: 'navigation.quality'}},
  {path: 'ykj',  pathMatch: 'full', component: YkjComponent, data: {title: 'navigation.ykj'}},
  {path: 'emk',  pathMatch: 'full', component: EmkComponent, data: {title: 'Eliömaakunnat'}},
  {path: 'checklist',  pathMatch: 'full', component: ChecklistComponent, data: {title: 'navigation.checklist'}}
];

const themeFormAdditionalRoutes: {
  [formID: string]: {
    [name: string]: Routes
  }
} = {
  [Global.forms.nafi]: {
    additionalChildren: [
      {path: 'stats', pathMatch: 'full', component: NafiResultComponent},
      {path: 'templates', pathMatch: 'full', component: NafiTemplatesComponent, canActivate: [OnlyLoggedIn]},
    ]
  },
  [Global.forms.lineTransect]: {
    instructions: [
      {path: 'instructions', pathMatch: 'full', component: LineTransectInstructionsComponent, data: { title: 'lineTransect.title' } }
    ],
    form: [
      {
        path: 'form',
        component: FormComponent,
        canActivate: [OnlyLoggedIn, HasFormPermission],
      },
      {
        path: 'form/:formID',
        component: FormComponent,
        canActivate: [OnlyLoggedIn, HasFormPermission]
      },
      {
        path: 'form/:formID/:id',
        pathMatch: 'full',
        component: FormComponent,
        canActivate: [OnlyLoggedIn, HasFormPermission],
        canDeactivate: [DocumentDeActivateGuard],
      },
    ],
    places: [
      {
        path: 'places/:collectionId/:formId',
        pathMatch: 'full',
        component: NamedPlaceComponent,
        resolve: { data: NamedPlaceResolver },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        canActivate: [OnlyLoggedIn, HasFormPermission],
        data: { noScrollToTop: true }
      }
    ],
    additionalChildren: [
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
  [Global.forms.wbc]: {
    instructions: [
      {path: 'instructions', pathMatch: 'full', component: WbcInstructionsComponent, data: { title: 'wbc.title' } }
     ],
    additionalChildren: [
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
};

Object.keys(Global.themeForms).forEach(formID => {
  const form = Global.themeForms[formID];
  const extra = themeFormAdditionalRoutes[formID] || {};
  let children = [
    {path: '', pathMatch: 'full', redirectTo: 'instructions'},
  ];
    const _children: {[name: string]: Routes} = {
      instructions: [
        {path: 'instructions', pathMatch: 'full', component: InstructionsComponent},
      ],
      form: [
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
    ],
    places: [
      {
        path: 'places',
        redirectTo: 'form',
      },
      {
        path: 'places/:collectionId/:formId',
        pathMatch: 'full',
        component: NamedPlaceComponent,
        resolve: { data: NamedPlaceResolver },
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        canActivate: [OnlyLoggedIn, HasFormPermission],
        data: { noScrollToTop: true }
      }
    ],
    ownSubmissions: [
      {
        path: 'ownSubmissions',
        pathMatch: 'full',
        component: ThemeOwnSubmissionsComponent,
        canActivate: [OnlyLoggedIn, HasFormPermission],
      }
    ]
  };
  Object.keys(_children).forEach(name => {
    const navLink = (form.navLinks || {})[name] || {};
    const {visible = true} = navLink;
    if (!visible) {
      return;
    }
    const accessLevel = merge(ThemeFormService.defaultNavLinks[name], navLink);
      _children[name].forEach(childRoute => {
        if (!accessLevel) {
            delete childRoute.canActivate;
        }
      });

    if (extra[name]) {
      children = [...children, ...(<any> extra[name])];
    } else {
      children = [...children, ...(<any> _children[name])];
    }
  });
  if (extra.additionalChildren) {
    children = [...children, ...(<any> extra.additionalChildren)];
  }

  const route: Route = {
    path: form.path,
    component: MonitoringThemeBaseComponent,
    children,
    data: form
  };
  routes.push(route);
});


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [NamedPlaceResolver]
})
export class ThemeRoutingModule { }
