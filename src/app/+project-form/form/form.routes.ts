import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormComponent } from './form.component';
import { NamedPlaceComponent } from './named-place/named-place/named-place.component';
import { NpEditFormComponent } from './named-place/np-edit-form/np-edit-form.component';
import { NpPrintComponent } from './named-place/np-print/np-print.component';
import { OnlyLoggedIn } from '../../shared/route/only-logged-in';
import { DocumentDeActivateGuard } from '../../shared/guards/document-de-activate.guard';
import { HasFormPermission } from '../guards/has-form-permission';
import { HasViewPermission } from '../guards/has-view-permission.service';

export const routes: Routes = [
  {
    path: '', component: FormComponent,
    canDeactivate: [DocumentDeActivateGuard],
    data: {displayFeedback: false}
  },
  {
    path: ':formOrDocument/places/new', component: NpEditFormComponent,
    canActivate: [OnlyLoggedIn, HasFormPermission],
    data: {displayFeedback: false}
  },
  {
    path: ':formOrDocument/places/:namedPlace/print', component: NpPrintComponent
  },
  {
    path: ':formOrDocument/places/:namedPlace/edit', component: NpEditFormComponent,
    canActivate: [OnlyLoggedIn, HasFormPermission],
    data: {displayFeedback: false}
  },
  {
    path: ':formOrDocument/places/:namedPlace', component: FormComponent,
    canActivate: [OnlyLoggedIn, HasFormPermission],
    canDeactivate: [DocumentDeActivateGuard],
    data: {displayFeedback: false}
  },
  {
    path: ':formOrDocument/places', component: NamedPlaceComponent,
    canActivate: [HasViewPermission],
    data: {noScrollToTop: true}
  },
  {
    path: 'places/new', component: NpEditFormComponent,
    canActivate: [OnlyLoggedIn, HasFormPermission],
    data: {displayFeedback: false}
   },
  {
    path: 'places/:namedPlace/edit', component: NpEditFormComponent,
    canActivate: [OnlyLoggedIn, HasFormPermission],
    data: {displayFeedback: false}
  },
  {
    path: 'places/:namedPlace/print', component: NpPrintComponent
  },
  {
    path: 'places/:namedPlace', component: FormComponent,
    canActivate: [OnlyLoggedIn, HasFormPermission],
    canDeactivate: [DocumentDeActivateGuard],
    data: {displayFeedback: false}
  },
  {
    path: 'places', component: NamedPlaceComponent,
    canActivate: [HasViewPermission],
    data: { noScrollToTop: true }
  },
  {
    path: ':formOrDocument/:document', component: FormComponent,
    canDeactivate: [DocumentDeActivateGuard],
    data: {displayFeedback: false}
  },
  {
    path: ':formOrDocument', component: FormComponent,
    canDeactivate: [DocumentDeActivateGuard],
    data: {displayFeedback: false}
  },
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
