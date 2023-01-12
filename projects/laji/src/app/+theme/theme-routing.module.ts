/* eslint-disable max-len */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HerpetologyComponent } from './herpetology/herpetology.component';
import { IdentifyComponent } from './identify/identify.component';
import { QualityComponent } from './quality/quality.component';
import { ThemeComponent } from './theme.component';
import { ChecklistComponent } from './checklist/checklist.component';
import { GeneticResourceComponent } from './genetic-resource/genetic-resource.component';
import { DatasetsComponent } from './datasets/datasets.component';
import { PinkkaComponent } from './pinkka/pinkka.component';
import { BibliographyComponent } from './bibliography/bibliography.component';
import { InsectGuideComponent } from './insect-guide/insect-guide.component';
import { ProtaxComponent } from './protax/protax.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { GeneticResourceLayoutComponent } from './genetic-resource/layout/genetic-resource-layout.component';
import { GeneticResourceInstructionsComponent } from './genetic-resource/instructions/genetic-resource-instructions.component';
import { KerttuClosedComponent } from './kerttu/kerttu-closed.component';
import { DatasetMetadataComponent } from '../shared-modules/dataset-metadata/dataset-metadata.component';

/* eslint-enable max-len */

const routes: Routes = [
  {path: '',  pathMatch: 'full', component: ThemeComponent, data: {title: 'navigation.theme'}},
  {
    path: 'luomusgrc',
    pathMatch: 'prefix',
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
    pathMatch: 'prefix',
    children: [
      {
        path: '',
        component: DatasetsComponent,
        data: {
          title: 'datasets.label',
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
    pathMatch: 'prefix',
    component: KerttuClosedComponent,
    data: {
      title: 'Kerttu'
    },
    children: [
      {path: 'instructions', pathMatch: 'full', redirectTo: ''},
      {path: 'expertise', pathMatch: 'full', redirectTo: ''},
      {path: 'letters', pathMatch: 'full', redirectTo: ''},
      {path: 'recordings', pathMatch: 'full', redirectTo: ''},
      {path: 'result', pathMatch: 'full', redirectTo: ''}
    ]
  },
  {
    path: 'dataset-metadata',
    loadChildren: () => import('../shared-modules/dataset-metadata/dataset-metadata.module').then(m => m.DatasetMetadataModule)
  },
  {path: 'protax', pathMatch: 'full', component: ProtaxComponent, data: {title: 'theme.protax'}},
  {path: 'herpetology',  pathMatch: 'full', component: HerpetologyComponent, data: {title: 'navigation.herpetology'}},
  {path: 'identify',  pathMatch: 'full', component: IdentifyComponent, data: {title: 'navigation.identify'}},
  {path: 'quality',  pathMatch: 'full', component: QualityComponent, data: {title: 'navigation.quality'}},
  {path: 'ykj',  pathMatch: 'full', redirectTo: '/about/5310', data: {title: 'navigation.ykj'}},
  {path: 'checklist',  pathMatch: 'full', component: ChecklistComponent, data: {title: 'navigation.checklist'}},
  {path: 'pinkka',  pathMatch: 'full', component: PinkkaComponent, data: {title: 'navigation.pinkka'}},
  {path: 'publications',  pathMatch: 'full', component: BibliographyComponent, data: {title: 'finbif-bib.title'}},
  {path: 'hyonteisopas',  pathMatch: 'full', component: InsectGuideComponent, data: {title: 'navigation.hyonteisopas'}},
  {path: '**', pathMatch: 'prefix', component: NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class ThemeRoutingModule { }
