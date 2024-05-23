import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormComponent } from './form.component';
import { NpEditFormComponent } from './named-place/np-edit-form/np-edit-form.component';
import { NpPrintComponent } from './named-place/np-print/np-print.component';
import { DocumentDeActivateGuard } from '../../shared/guards/document-de-activate.guard';
import { HasFormPermission } from '../guards/has-form-permission';
import { HasViewPermission } from '../guards/has-view-permission';
import { NamedPlaceWrapperComponent } from './named-place/named-place-wrapper/named-place-wrapper.component';
import { NamedPlaceLinkerWrapperComponent } from './named-place-linker/named-place-linker-wrapper.component';

export const routes: Routes = [
  {
    path: '', component: FormComponent,
    canDeactivate: [DocumentDeActivateGuard],
    data: {displayFeedback: false},
    pathMatch: 'prefix'
  },
  {
    path: 'template', component: FormComponent,
    canDeactivate: [DocumentDeActivateGuard],
    data: {displayFeedback: false, template: true},
    pathMatch: 'prefix'

  },
  {
    path: ':formOrDocument/places/new', component: NpEditFormComponent,
    canActivate: [HasFormPermission],
    data: {displayFeedback: false},
    pathMatch: 'prefix'

  },
  {
    path: ':formOrDocument/places/:namedPlace/print', component: NpPrintComponent,
    pathMatch: 'prefix'

  },
  {
    path: ':formOrDocument/places/:namedPlace/edit', component: NpEditFormComponent,
    canActivate: [HasFormPermission],
    data: {displayFeedback: false},
    pathMatch: 'prefix'

  },
  {
    path: ':formOrDocument/places/:namedPlace', component: FormComponent,
    canActivate: [HasFormPermission],
    canDeactivate: [DocumentDeActivateGuard],
    data: {displayFeedback: false},
    pathMatch: 'prefix'

  },
  {
    path: ':formOrDocument/places/:namedPlace/template', component: FormComponent,
    canActivate: [HasFormPermission],
    canDeactivate: [DocumentDeActivateGuard],
    data: {displayFeedback: false, template: true},
    pathMatch: 'prefix'

  },
  {
    path: ':formOrDocument/places', component: NamedPlaceWrapperComponent,
    canActivate: [HasViewPermission],
    data: {noScrollToTop: true},
    pathMatch: 'prefix'

  },
  {
    path: 'places/new', component: NpEditFormComponent,
    canActivate: [HasFormPermission],
    data: {displayFeedback: false},
    pathMatch: 'prefix'

   },
  {
    path: 'places/:namedPlace/edit', component: NpEditFormComponent,
    canActivate: [HasFormPermission],
    data: {displayFeedback: false},
    pathMatch: 'prefix'

  },
  {
    path: 'places/:namedPlace/print', component: NpPrintComponent,
    pathMatch: 'prefix'

  },
  {
    path: 'places/:namedPlace', component: FormComponent,
    canActivate: [HasFormPermission],
    canDeactivate: [DocumentDeActivateGuard],
    data: {displayFeedback: false},
    pathMatch: 'prefix'

  },
  {
    path: 'places/:namedPlace/template', component: FormComponent,
    canActivate: [HasFormPermission],
    canDeactivate: [DocumentDeActivateGuard],
    data: {displayFeedback: false, template: true},
    pathMatch: 'prefix'

  },
  {
    path: 'places', component: NamedPlaceWrapperComponent,
    canActivate: [HasViewPermission],
    data: { noScrollToTop: true },
    pathMatch: 'prefix'

  },
  {
    path: ':formOrDocument/link', component: NamedPlaceLinkerWrapperComponent,
    data: {displayFeedback: false},
    pathMatch: 'prefix'
  },
  {
    path: ':formOrDocument/:document', component: FormComponent,
    canDeactivate: [DocumentDeActivateGuard],
    data: {displayFeedback: false},
    pathMatch: 'prefix'

  },
  {
    path: ':formOrDocument/:document/link', component: NamedPlaceLinkerWrapperComponent,
    data: {displayFeedback: false},
    pathMatch: 'prefix'

  },
  {
    path: ':formOrDocument', component: FormComponent,
    canDeactivate: [DocumentDeActivateGuard],
    data: {displayFeedback: false},
    pathMatch: 'prefix'

  },
  {
    path: ':formOrDocument/template', component: FormComponent,
    canDeactivate: [DocumentDeActivateGuard],
    data: {displayFeedback: false, template: true},
    pathMatch: 'prefix'

  },
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);
