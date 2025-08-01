import { Component, OnInit, ViewChild } from '@angular/core';
import { map, switchMap, take } from 'rxjs/operators';
import { ProjectFormService } from '../../shared/service/project-form.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { Form } from '../../shared/model/Form';
import { FormService } from '../../shared/service/form.service';
import { DocumentFormComponent } from './document-form/document-form.component';
import { UserService } from '../../shared/service/user.service';

interface ViewModel {
  formID: string;
  documentID?: string;
  namedPlaceID?: string;
  template?: boolean;
}

@Component({
  template: `
    <ng-container *ngIf="(vm$ | async) as vm; else loader">
      <laji-document-form
        [formID]="vm.formID"
        [documentID]="vm.documentID!"
        [namedPlaceID]="vm.namedPlaceID!"
        [template]="vm.template!"
      >
      </laji-document-form>
    </ng-container>
    <ng-template #loader>
      <laji-spinner></laji-spinner>
    </ng-template>
  `,
  selector: 'laji-project-form-form'
})
export class FormComponent implements OnInit {

  vm$!: Observable<ViewModel>;

  @ViewChild(DocumentFormComponent) documentComponent!: DocumentFormComponent;

  constructor(private projectFormService: ProjectFormService,
              private route: ActivatedRoute,
              private router: Router,
              private formService: FormService,
              private userService: UserService
  ) {}

  ngOnInit() {
    this.vm$ = this.projectFormService.getProjectFormFromRoute$(this.route).pipe(
      switchMap(({form, subForms}) => this.route.params.pipe(
        switchMap((routeParams) => this.route.data.pipe(
          switchMap(({template}) => this.tryRedirectToSubForm(form, routeParams).pipe(
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
                this.router.navigate([form.id], {relativeTo: this.route, replaceUrl: true});
                return EMPTY;
              }
              const documentID = paramsStack.pop();
              return (_usedSubForm === form
                ? of(form)
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                : this.formService.getForm(_usedSubForm!.id)
              ).pipe(
                switchMap(usedSubForm => {
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  const namedPlaceID = usedSubForm!.options?.useNamedPlaces && routeParams['namedPlace'];
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  if (usedSubForm!.options?.useNamedPlaces && !documentID && !namedPlaceID) {
                    this.router.navigate(['places'], {relativeTo: this.route, replaceUrl: true});
                    return EMPTY;
                  }

                  return this.userService.isLoggedIn$.pipe(switchMap(isLoggedIn => {
                    if (!isLoggedIn && !usedSubForm!.options?.openForm) {
                      this.userService.redirectToLogin();
                      return EMPTY;
                    }
                    return of({
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      formID: usedSubForm!.id,
                      documentID,
                      namedPlaceID,
                      template: !!template
                    });
                  }));
                })
              );
            }))
          )
        ))
      ))
    );
  }

  tryRedirectToSubForm(form: Form.SchemaForm, routeParams: Params): Observable<boolean> {
    const navigateToForm = (parentID: string, formID: string) => {
      const route = [parentID, 'form', formID, routeParams['formOrDocument']];
      if (this.router.url.match(/\/link$/)) {
        route.push('link');
      }
      this.projectFormService.getProjectRootRoute$(this.route).pipe(take(1)).subscribe(rootRoute =>
        this.router.navigate(route, {relativeTo: rootRoute.parent, replaceUrl: true})
      );
      return true;
    };
    if (routeParams['formOrDocument']?.match(/^((JX\.)|(T:))/)) {
      if (form.options?.forms?.length) {
        return of(navigateToForm(form.id, form.id));
      }
      return this.formService.getAllForms().pipe(
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

  canDeactivate(...params: any[]) {
    return this.documentComponent
      ? this.documentComponent.canDeactivate(...params)
      : true;
  }
}
