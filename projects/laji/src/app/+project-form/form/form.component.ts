import { Component, OnInit, ViewChild } from '@angular/core';
import { map, switchMap, take } from 'rxjs/operators';
import { ProjectFormService } from '../project-form.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { Form } from '../../shared/model/Form';
import { BrowserService } from '../../shared/service/browser.service';
import { NamedPlacesService } from '../../shared/service/named-places.service';
import { NamedPlace } from '../../shared/model/NamedPlace';
import { FormService } from '../../shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { DocumentFormComponent } from './document-form/document-form.component';
import { UserService } from '../../shared/service/user.service';

interface ViewModel {
  form: Form.SchemaForm;
  documentID?: string;
  namedPlace?: NamedPlace;
}

@Component({
  template: `
    <ng-container *ngIf="(vm$ | async) as vm; else loader">
      <laji-project-form-document-form
        [form]="vm.form"
        [documentID]="vm.documentID"
        [namedPlace]="vm.namedPlace"
      >
      </laji-project-form-document-form>
    </ng-container>
    <ng-template #loader>
      <laji-spinner></laji-spinner>
    </ng-template>
  `,
  selector: 'laji-project-form-form'
})
export class FormComponent implements OnInit {

  vm$: Observable<ViewModel>;

  @ViewChild(DocumentFormComponent) documentComponent: DocumentFormComponent;

  constructor(private projectFormService: ProjectFormService,
              private route: ActivatedRoute,
              private router: Router,
              private browserService: BrowserService,
              private namedPlacesService: NamedPlacesService,
              private formService: FormService,
              private translate: TranslateService,
              private userService: UserService,
  ) {}

  ngOnInit() {
    this.vm$ = this.projectFormService.getProjectFormFromRoute$(this.route).pipe(
      switchMap(({form, subForms}) => this.route.params.pipe(
        switchMap(routeParams => this.tryRedirectToSubForm(form, routeParams).pipe(
          switchMap(redirected => {
            if (redirected) {
              return EMPTY;
            }
            const paramsStack = [
              routeParams['document'],
              routeParams['formOrDocument'],
            ];
            const hasManyForms = subForms.length;
            const formID = hasManyForms
              ? paramsStack.pop()
              : form.id;
            const _usedSubForm = [form, ...subForms].find(f => f.id === formID);
            if (hasManyForms && !_usedSubForm) {
              this.router.navigate([form.id], {relativeTo: this.route});
              return EMPTY;
            }
            const documentID = paramsStack.pop();
            return (_usedSubForm === form ?
              of(form)
              : this.formService.getForm(_usedSubForm.id, this.translate.currentLang)
            ).pipe(
              switchMap(usedSubForm => {
                const namedPlaceID = usedSubForm.options?.useNamedPlaces && routeParams['namedPlace'];
                const namedPlace$ = namedPlaceID
                  ? this.namedPlacesService.getNamedPlace(namedPlaceID, undefined, usedSubForm.options?.namedPlaceOptions?.includeUnits)
                  : of(null);
                if (usedSubForm.options?.useNamedPlaces && !documentID && !namedPlaceID) {
                  this.router.navigate(['places'], {relativeTo: this.route, replaceUrl: true});
                  return EMPTY;
                }

                return this.userService.isLoggedIn$.pipe(switchMap(isLoggedIn => {
                  if (!isLoggedIn) {
                    this.userService.redirectToLogin();
                    return EMPTY;
                  }
                  return namedPlace$.pipe(map(namedPlace => ({
                    form: usedSubForm,
                    documentID,
                    namedPlace
                  })));
                }));
              })
            );
          }))
        )
      ))
    );
  }

  tryRedirectToSubForm(form: Form.SchemaForm, routeParams: Params): Observable<boolean> {
    const navigateToForm = (parentID: string, formID: string) => {
      const route = [parentID, 'form', formID, routeParams['formOrDocument']];
      if (this.router.url.match(/\/link$/)) {
        route.push('link');
      }
      this.projectFormService.getProjectRootRoute(this.route).pipe(take(1)).subscribe(rootRoute =>
        this.router.navigate(route, {relativeTo: rootRoute.parent, replaceUrl: true})
      );
      return true;
    };
    if (routeParams['formOrDocument']?.match(/^((JX\.)|(T:))/)) {
      if (form.options?.forms?.length) {
        return of(navigateToForm(form.id, form.id));
      }
      return this.formService.getAllForms(this.translate.currentLang).pipe(
        take(1),
        map(forms => {
            const parent = forms.find(f => f.options?.forms?.includes(form.id));
            if (parent) {
              return navigateToForm(parent.id, form.id);
            }
            return false;
          }
        )
      );
    }
    return of(false);
  }

  canDeactivate(...params) {
    return this.documentComponent
      ? this.documentComponent.canDeactivate(...params)
      : true;
  }
}
