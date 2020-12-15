import { map, mergeMap, switchMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { FormService } from '../shared/service/form.service';
import { ActivatedRoute, Params } from '@angular/router';
import { Injectable } from '@angular/core';
import { Form } from '../shared/model/Form';
import { combineLatest, forkJoin, Observable, of } from 'rxjs';
import { NamedPlacesService } from '../shared/service/named-places.service';
import { NamedPlace } from '../shared/model/NamedPlace';
import { Global } from '../../environments/global';


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

@Injectable()
export class ProjectFormService {
  constructor (
    private formService: FormService,
    private translate: TranslateService,
    private namedPlacesService: NamedPlacesService
  ) { }

  getFormFromRoute$(route: ActivatedRoute) {
    return this.getFormID(route).pipe(switchMap(formID => this.formService.getForm(formID, this.translate.currentLang)));
  }

  getProjectFormFromRoute$(route: ActivatedRoute): Observable<ProjectForm> {
    const form$ = this.getFormFromRoute$(route);
    return form$.pipe(
      mergeMap(form =>
        (form.options?.forms
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

  private getFormID(route: ActivatedRoute): Observable<string> {
    return this.getProjectRootRoute(route).pipe(map(_route => _route.snapshot.params['projectID']));
  }

  getExcelFormIDs(projectForm: ProjectForm) {
    const allowsExcel = (form: Form.SchemaForm) => form.options?.allowExcel && form.id;
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
        const query$ = documentForm$.pipe(map(documentForm => this.queryToModelFormat(queryParams)));
        return combineLatest(documentForm$, namedPlace$, query$).pipe(
          map(([
            documentForm,
            namedPlace,
            query]) => ({documentForm, namedPlace, ...query}))
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
