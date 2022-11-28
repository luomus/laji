import { map, mergeMap, switchMap, take } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { FormService } from './form.service';
import { ActivatedRoute } from '@angular/router';
import { Injectable } from '@angular/core';
import { Form } from '../model/Form';
import { combineLatest, Observable, of, ReplaySubject } from 'rxjs';
import { NamedPlacesService } from './named-places.service';
import { NamedPlace } from '../model/NamedPlace';

export interface ProjectForm {
  form: Form.SchemaForm;
  subForms: Form.List[];
}

export interface NamedPlacesQuery {
  tags?: string;
  birdAssociationArea?: string;
  municipality?: string;
  activeNP?: string;
}
export interface NamedPlacesQueryModel {
  tags: string[];
  birdAssociationArea: string;
  municipality: string;
  activeNP?: string;
}

export interface NamedPlacesRouteData extends NamedPlacesQueryModel {
  documentForm: Form.SchemaForm;
  namedPlace?: NamedPlace;
}

@Injectable({providedIn: 'root'})
export class ProjectFormService {
  constructor(
    private formService: FormService,
    private translate: TranslateService,
    private namedPlacesService: NamedPlacesService
  ) { }

  currentFormID: string;
  form$: ReplaySubject<Form.SchemaForm>;
  documentFormVisible$ = new ReplaySubject<boolean>();

  getFormFromRoute$(route: ActivatedRoute): Observable<Form.SchemaForm> {
    return this.getFormID(route).pipe(switchMap(formID => this.getForm(formID)));
  }

  getForm(id: string): Observable<Form.SchemaForm> {
    if (this.currentFormID === id) {
      return this.form$.asObservable();
    }
    this.currentFormID = id;
    this.form$ = new ReplaySubject<Form.SchemaForm>();
    this.formService.getForm(id).pipe(take(1)).subscribe(form => {
      this.form$.next(form);
    });
    return this.form$.asObservable();
  }

  updateLocalForm(form: Form.SchemaForm) {
    const {id} = form;
    if (this.currentFormID !== id) {
      this.currentFormID = id;
      this.form$ = new ReplaySubject<Form.SchemaForm>();
    }
    this.form$.next(form);
  }

  setDocumentFormVisible(visible: boolean) {
    this.documentFormVisible$.next(visible);
  }

  getProjectFormFromRoute$(route: ActivatedRoute): Observable<ProjectForm> {
    const form$ = this.getFormFromRoute$(route);
    return form$.pipe(
      mergeMap(form =>
        (form?.options?.forms
            ? this.formService.getAllForms(this.translate.currentLang).pipe(map(forms => forms.filter(f => form.options.forms.indexOf(f.id) > -1)))
            : of([])
        ).pipe(
          map(forms => ({form, subForms: forms}))
        )
      )
    );
  }

  getProjectRootRoute(route: ActivatedRoute): Observable<ActivatedRoute> {
    return route.params.pipe(switchMap(params => {
      const formID = params['projectID'];
      if (!formID) {
        return this.getProjectRootRoute(route.parent);
      }
      return of(route);
    }));
  }

  getFormID(route: ActivatedRoute): Observable<string> {
    return this.getProjectRootRoute(route).pipe(map(_route => _route.snapshot.params['projectID']));
  }

  getExcelFormIDs(projectForm: ProjectForm): string[] {
    const allowsExcel = (form: Form.SchemaForm | Form.List) => form.options?.allowExcel && form.id;
    return [allowsExcel(projectForm.form), ...projectForm.subForms.map(allowsExcel)].filter(f => f);
  }

  getSubmissionsPageTitle(form: Form.SchemaForm, isAdmin: boolean) {
    return isAdmin
      ? form.options?.ownSubmissionsAdminTitle || 'haseka.ownSubmissions.allTitle'
      : form.options?.ownSubmissionsTitle || 'haseka.ownSubmissions.title';
  }


  getNamedPlacesRouteData$(route: ActivatedRoute): Observable<NamedPlacesRouteData> {
    return combineLatest(route.params, route.queryParams).pipe(
      switchMap(([params, queryParams]) => {
        const {formOrDocument: formID, namedPlace: namedPlaceID} = params;
        const namedPlace$ = this.namedPlacesService.getNamedPlace(namedPlaceID);
        const documentForm$ = formID
          ? this.getProjectFormFromRoute$(route).pipe(
            switchMap(projectForm => {
              const form = [projectForm.form, ...projectForm.subForms].find(f => f.id === formID);
              return form === projectForm.form
                ? of(form as Form.SchemaForm)
                : this.formService.getForm(form.id, this.translate.currentLang);
            })
          )
          : this.getFormFromRoute$(route);
        return combineLatest(documentForm$, namedPlace$).pipe(
          map(([
            documentForm,
            namedPlace ]) => ({documentForm, namedPlace, ...this.queryToModelFormat(queryParams)}))
        );
      })
    );
  }

  queryToModelFormat(queryParams): NamedPlacesQueryModel {
    return {
      ...queryParams,
      tags: queryParams['tags']?.split(',')
    };

  }

  getPlaceForm$(documentForm: Form.SchemaForm) {
    return this.formService.getPlaceForm(documentForm);
  }
}
