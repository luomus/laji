import { map, mergeMap, switchMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { FormService } from './form.service';
import { ActivatedRoute, Params } from '@angular/router';
import { Injectable } from '@angular/core';
import { Form } from '../model/Form';
import { BehaviorSubject, combineLatest, Observable, of, ReplaySubject, Subject } from 'rxjs';
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
  tags?: string[];
  birdAssociationArea?: string;
  municipality?: string;
  activeNP?: string;
}

export interface NamedPlacesRouteData extends NamedPlacesQueryModel {
  documentForm: Form.SchemaForm;
  namedPlace?: NamedPlace;
}

export interface ExcelFormOptions {
  formID: string;
  allowGenerate: boolean;
}

@Injectable({providedIn: 'root'})
export class ProjectFormService {
  constructor(
    private formService: FormService,
    private translate: TranslateService,
    private namedPlacesService: NamedPlacesService
  ) {
    this.translate.onLangChange.subscribe(() => {
      this.currentFormID = undefined;
    });
  }

  private currentFormID?: string;
  private form$?: ReplaySubject<Form.SchemaForm>;

  /** LajiFormBuilder can change the language of the form, without changing the lang of the whole page. */
  public localLang$ = new BehaviorSubject<string>(this.translate.currentLang);
  public remountLajiForm$ = new Subject<void>();

  getFormFromRoute$(route: ActivatedRoute): Observable<Form.SchemaForm> {
    return this.getFormID(route).pipe(switchMap(formID => this.getForm$(formID)));
  }

  getForm$(id: string): Observable<Form.SchemaForm> {
    if (this.currentFormID === id) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.form$!;
    }
    this.currentFormID = id;
    this.form$?.complete();
    this.form$ = new ReplaySubject(1);
    this.formService.getForm(id).subscribe(form => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.form$!.next(form);
    });
    return this.form$;
  }

  updateLocalForm(form: Form.SchemaForm) {
    const {id} = form;
    if (this.currentFormID !== id) {
      this.currentFormID = id;
      this.form$?.complete();
      this.form$ = new ReplaySubject(1);
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.form$!.next(form);
  }

  getProjectFormFromRoute$(route: ActivatedRoute): Observable<ProjectForm> {
    const form$ = this.getFormFromRoute$(route);
    return form$.pipe(
      mergeMap(form =>
        (form?.options?.forms
            ? this.formService.getAllForms().pipe(map(forms => forms.filter(f =>
                form!.options.forms!.indexOf(f.id) > -1)) // eslint-disable-line @typescript-eslint/no-non-null-assertion
            )
            : of([])
        ).pipe(
          map(forms => ({form, subForms: forms}))
        )
      )
    );
  }

  getProjectRootRoute$(route: ActivatedRoute): Observable<ActivatedRoute> {
    return route.params.pipe(switchMap(params => {
      const formID = params['projectID'];
      if (!formID) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.getProjectRootRoute$(route.parent!);
      }
      return of(route);
    }));
  }

  getFormID(route: ActivatedRoute): Observable<string> {
    return this.getProjectRootRoute$(route).pipe(map(_route => _route.snapshot.params['projectID']));
  }

  getExcelFormOptions(projectForm: ProjectForm, isAdmin: boolean): ExcelFormOptions[] {
    const getExcelOptions = (form: Form.SchemaForm | Form.List) => form.options?.allowExcel
      ? { formID: form.id, allowGenerate: isAdmin || form.options.allowExcelGeneration !== false }
      : undefined;
    return [getExcelOptions(projectForm.form), ...projectForm.subForms.map(getExcelOptions)].filter(f => f);
  }

  getExcelFormIDs(projectForm: ProjectForm, isAdmin: boolean): string[] {
    return this.getExcelFormOptions(projectForm, isAdmin).map(f => f.formID);
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
              if (projectForm.form.id === formID) {
                return of(projectForm.form);
              }
              const subForm = projectForm.subForms.find(f => f.id === formID);
              if (!subForm) {
                throw new Error('Route sub form isn\'t part of the form');
              }
              return this.formService.getForm(subForm.id).pipe(map(f => {
                if (!f) {
                throw new Error('Form had nonexistent sub form');
                }
                return f;
              }));
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

  queryToModelFormat(queryParams: Params): NamedPlacesQueryModel {
    return {
      ...queryParams,
      tags: queryParams['tags']?.split(',')
    };

  }

  getPlaceForm$(documentForm: Form.SchemaForm) {
    return this.formService.getPlaceForm(documentForm);
  }

  updateLocalLang(lang: string) {
    this.localLang$.next(lang);
  }

  remountLajiForm() {
    this.remountLajiForm$.next();
  }
}
