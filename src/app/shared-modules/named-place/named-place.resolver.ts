import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of, forkJoin, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { NamedPlacesService } from './named-places.service';
import { NamedPlaceQuery } from 'app/shared/api/NamedPlaceApi';
import { FormService } from 'app/shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'app/shared/service/user.service';
import { FormPermissionService, Rights } from 'app/+haseka/form-permission/form-permission.service';
import { environment } from 'environments/environment';
import { NamedPlace } from '../../shared/model/NamedPlace';

export interface NPResolverData {
  collectionId?: string;
  edit?: boolean;

  documentForm?: any;
  placeForm?: any;
  namedPlaces?: any[];
  user?: any;
  formRights?: Rights;

  birdAssociationId?: string;
  municipalityId?: string;
  tags?: string[];
  activeNPId?: any;
  activeNP?: NamedPlace;
}

@Injectable()
export class NamedPlaceResolver implements Resolve<Observable<NPResolverData>> {
  private collectionId;
  private documentFormId;
  private birdAssociationId;
  private municipalityId;
  private tags: string[];
  private lang;
  constructor(private formService: FormService,
              private translate: TranslateService,
              private namedPlacesService: NamedPlacesService,
              private userService: UserService,
              private formPermissionService: FormPermissionService) {}
  resolve(route: ActivatedRouteSnapshot): Observable<NPResolverData> {
    this.lang = this.translate.currentLang;

    const routeParams = route.params;
    this.collectionId = routeParams['collectionId'];
    this.documentFormId = routeParams['formId'];

    const queryParams = route.queryParams;
    const edit = queryParams['edit'] === 'true';
    this.birdAssociationId = queryParams['birdAssociationArea'];
    this.municipalityId = queryParams['municipality'] || 'all';
    this.tags = (queryParams['tags'] || '').split(',');
    const activeNPId = queryParams['activeNP'];

    return this.getDocumentForm$().pipe(
      switchMap((documentForm) => this.userService.getUser().pipe(map((user) => ({documentForm, user})))),
      switchMap(data => forkJoin(
          this.getNamedPlaces$(data.documentForm),
          this.getPlaceForm$(data.documentForm.namedPlaceOptions
            && data.documentForm.namedPlaceOptions.formID
            || environment.namedPlaceForm
          ),
          this.getFormRights$(data.documentForm),
          this.namedPlacesService.getNamedPlace(activeNPId, undefined, (data.documentForm.namedPlaceOptions || {}).includeUnits)
        ).pipe(
          map<any, NPResolverData>(([namedPlaces, placeForm, formRights, activeNP]) => ({
            ...data,
            formRights,
            placeForm,
            namedPlaces: this.npRequirementsNotMet(data.documentForm) ? undefined : namedPlaces,
            edit: edit,
            collectionId: this.collectionId,
            municipalityId: this.municipalityId,
            birdAssociationId: this.birdAssociationId,
            tags: this.tags,
            activeNPId: activeNPId,
            activeNP
          }))
        )
      )
    );
  }

  getDocumentForm$(): Observable<any> {
    return this.formService.getForm(this.documentFormId, this.lang)
      .pipe(
        catchError((err) => {
          const msgKey = err.status === 404
            ? 'haseka.form.formNotFound'
            : 'haseka.form.genericError';
          return throwError(
            this.translate.instant(msgKey, {formId: this.documentFormId})
          );
        })
      );
  }

  getPlaceForm$(id: string): Observable<any> {
    if (!id) {
      return of([]);
    }
    return this.formService.load(id, this.lang).pipe(
      catchError((err) => {
        const msgKey = err.status === 404
          ? 'haseka.form.formNotFound'
          : 'haseka.form.genericError';
        return throwError(
          this.translate.instant(msgKey, {formId: id})
        );
      })
    );
  }

  getNamedPlaces$(documentForm): Observable<any> {
    const selected = (documentForm.options && documentForm.options.namedPlaceList || []).map((field: string) => field.replace('$.', ''));
    if (documentForm.namedPlaceOptions && !documentForm.namedPlaceOptions.hideMapTab) {
      selected.push('geometry');
    }
    if (documentForm.features && documentForm.features.indexOf('MHL.featureReserve') !== -1 && selected.indexOf('reserve') === -1) {
      selected.push('reserve');
    }
    const query: NamedPlaceQuery = {
      collectionID: this.collectionId,
      municipality: this.municipalityId,
      birdAssociationArea: this.birdAssociationId,
      tags: this.tags.join(','),
      includeUnits: documentForm.namedPlaceOptions.includeUnits,
      selectedFields: selected.filter(field => field.charAt(0) !== '_').join(',')
    };

    if (this.npRequirementsNotMet(documentForm)) {
      return of([]);
    }

    return this.namedPlacesService.getAllNamePlaces(query)
      .pipe(
        catchError(() => {
          return throwError(this.translate.instant('np.loadError'));
        })
      );
  }

  getFormRights$(documentForm: any): Observable<Rights> {
    return this.formPermissionService.getRights(documentForm);
  }

  npRequirementsNotMet(documentForm) {
    return (
      (documentForm.features
      .includes('MHL.featureFilterNamedPlacesByMunicipality')
      && !this.municipalityId)
      || (documentForm.features
      .includes('MHL.featureFilterNamedPlacesByBirdAssociationArea')
      && !this.birdAssociationId)
    );
  }
}
