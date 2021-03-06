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
    data: {displayFeedback: false}
  },
  {
    path: ':formOrDocument/places/new', component: NpEditFormComponent,
    canActivate: [HasFormPermission],
    data: {displayFeedback: false}
  },
  {
    path: ':formOrDocument/places/:namedPlace/print', component: NpPrintComponent
  },
  {
    path: ':formOrDocument/places/:namedPlace/edit', component: NpEditFormComponent,
    canActivate: [HasFormPermission],
    data: {displayFeedback: false}
  },
  {
    path: ':formOrDocument/places/:namedPlace', component: FormComponent,
    canActivate: [HasFormPermission],
    canDeactivate: [DocumentDeActivateGuard],
    data: {displayFeedback: false}
  },
  {
    path: ':formOrDocument/places', component: NamedPlaceWrapperComponent,
    canActivate: [HasViewPermission],
    data: {noScrollToTop: true}
  },
  {
    path: 'places/new', component: NpEditFormComponent,
    canActivate: [HasFormPermission],
    data: {displayFeedback: false}
   },
  {
    path: 'places/:namedPlace/edit', component: NpEditFormComponent,
    canActivate: [HasFormPermission],
    data: {displayFeedback: false}
  },
  {
    path: 'places/:namedPlace/print', component: NpPrintComponent
  },
  {
    path: 'places/:namedPlace', component: FormComponent,
    canActivate: [HasFormPermission],
    canDeactivate: [DocumentDeActivateGuard],
    data: {displayFeedback: false}
  },
  {
    path: 'places', component: NamedPlaceWrapperComponent,
    canActivate: [HasViewPermission],
    data: { noScrollToTop: true }
  },
  {
    path: ':formOrDocument/:document', component: FormComponent,
    canDeactivate: [DocumentDeActivateGuard],
    data: {displayFeedback: false}
  },
  {
    path: ':formOrDocument/:document/link', component: NamedPlaceLinkerWrapperComponent,
    data: {displayFeedback: false}
  },
  {
    path: ':formOrDocument', component: FormComponent,
    canDeactivate: [DocumentDeActivateGuard],
    data: {displayFeedback: false}
  },
  {
    path: ':formOrDocument/link', component: NamedPlaceLinkerWrapperComponent,
    data: {displayFeedback: false}
  },
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);
