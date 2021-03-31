/* tslint:disable:max-line-length */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OnlyLoggedIn } from '../shared/route/only-logged-in';
import { HerpetologyComponent } from './herpetology/herpetology.component';
import { DocumentDeActivateGuard } from '../shared/guards/document-de-activate.guard';
import { YkjComponent } from './ykj/ykj.component';
import { EmkComponent } from './emk/emk.component';
import { IdentifyComponent } from './identify/identify.component';
import { QualityComponent } from './quality/quality.component';
import { ThemeComponent } from './theme.component';
import { ChecklistComponent } from './checklist/checklist.component';
import { GeneticResourceComponent } from './genetic-resource/genetic-resource.component';
import { DatasetsComponent } from './datasets/datasets.component';
import { KerttuComponent } from './kerttu/kerttu.component';
import { KerttuInstructionsComponent } from './kerttu/kerttu-instructions/kerttu-instructions.component';
import { PinkkaComponent } from './pinkka/pinkka.component';
import { BibliographyComponent } from './bibliography/bibliography.component';
import { InsectGuideComponent } from './insect-guide/insect-guide.component';
import {KerttuExpertiseFormComponent} from './kerttu/kerttu-expertise-form/kerttu-expertise-form.component';
import {KerttuLetterAnnotationComponent} from './kerttu/kerttu-letter-annotation/kerttu-letter-annotation.component';
import {KerttuRecordingAnnotationComponent} from './kerttu/kerttu-recording-annotation/kerttu-recording-annotation.component';
import { ProtaxComponent } from './protax/protax.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { GeneticResourceLayoutComponent } from './genetic-resource/layout/genetic-resource-layout.component';
import { GeneticResourceInstructionsComponent } from './genetic-resource/instructions/genetic-resource-instructions.component';
import {KerttuResultComponent} from './kerttu/kerttu-result/kerttu-result.component';

/* tslint:enable:max-line-length */

const routes: Routes = [
  {path: '',  pathMatch: 'full', component: ThemeComponent, data: {title: 'navigation.theme'}},
  {
    path: 'luomusgrc',
    component: GeneticResourceLayoutComponent,
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'instructions'},
      {path: 'instructions', pathMatch: 'full', component: GeneticResourceInstructionsComponent},
      {
        path: 'search',
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'list'
          },
          {
            path: ':tab',
            pathMatch: 'full',
            component: GeneticResourceComponent,
            data: {
              noScrollToTop: true
            }
          }
        ]
      },
    ],
  },
  {
    path: 'datasets',
    children: [
      {
        path: '',
        component: DatasetsComponent,
        data: {
          breadcrumbs: [
            {
              link: '/theme',
              label: 'navigation.theme'
            },
            {
              link: '../',
              label: 'datasets.label'
            }
          ]
        }
      },
    ],
  },
  {
    path: 'kerttu',
    component: KerttuComponent,
    data: {
      title: 'Kerttu'
    },
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'instructions'},
      {path: 'instructions', pathMatch: 'full', component: KerttuInstructionsComponent},
      {path: 'expertise', pathMatch: 'full', component: KerttuExpertiseFormComponent, canActivate: [OnlyLoggedIn], canDeactivate: [DocumentDeActivateGuard]},
      {path: 'letters', pathMatch: 'full', component: KerttuLetterAnnotationComponent, canActivate: [OnlyLoggedIn]},
      {path: 'recordings', pathMatch: 'full', component: KerttuRecordingAnnotationComponent, canActivate: [OnlyLoggedIn], canDeactivate: [DocumentDeActivateGuard]},
      {path: 'result', pathMatch: 'full', component: KerttuResultComponent}
    ]
  },
  {path: 'protax', pathMatch: 'full', component: ProtaxComponent, data: {title: 'theme.protax'}},
  {path: 'herpetology',  pathMatch: 'full', component: HerpetologyComponent, data: {title: 'navigation.herpetology'}},
  {path: 'identify',  pathMatch: 'full', component: IdentifyComponent, data: {title: 'navigation.identify'}},
  {path: 'quality',  pathMatch: 'full', component: QualityComponent, data: {title: 'navigation.quality'}},
  {path: 'ykj',  pathMatch: 'full', component: YkjComponent, data: {title: 'navigation.ykj'}},
  {path: 'emk',  pathMatch: 'full', component: EmkComponent, data: {title: 'Eliömaakunnat'}},
  {path: 'checklist',  pathMatch: 'full', component: ChecklistComponent, data: {title: 'navigation.checklist'}},
  {path: 'pinkka',  pathMatch: 'full', component: PinkkaComponent, data: {title: 'navigation.pinkka'}},
  {path: 'publications',  pathMatch: 'full', component: BibliographyComponent, data: {title: 'finbif-bib.title'}},
  {path: 'hyonteisopas',  pathMatch: 'full', component: InsectGuideComponent, data: {title: 'navigation.hyonteisopas'}},
  {path: '**', component: NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class ThemeRoutingModule { }
