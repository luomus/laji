import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of, forkJoin, throwError } from 'rxjs';
import { mergeMap, map, catchError, switchMap } from 'rxjs/operators';
import { NamedPlacesService } from './named-places.service';
import { NamedPlaceQuery } from 'app/shared/api/NamedPlaceApi';
import { FormService } from 'app/shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'app/shared/service/user.service';
import { FormPermissionService, Rights } from 'app/+haseka/form-permission/form-permission.service';
import { environment } from 'environments/environment';

export interface NPResolverData {
    collectionId?: string;
    edit?: boolean;

    eventForm?: any;
    placeForm?: any;
    namedPlaces?: any[];
    user?: any;
    formRights?: Rights;

    birdAssociationId?: string;
    municipalityId?: string;
    activeNPId?: any;
}

@Injectable()
export class NamedPlaceResolver implements Resolve<Observable<NPResolverData>> {
    private collectionId;
    private eventFormId;
    private birdAssociationId;
    private municipalityId;
    private lang;
    constructor(private formService: FormService,
                private translate: TranslateService,
                private namedPlacesService: NamedPlacesService,
                private userService: UserService,
                private formPermissionService: FormPermissionService) {}
    resolve(route: ActivatedRouteSnapshot): Observable<NPResolverData> {
        this.lang = this.findLangFromRoute(route);

        const routeParams = route.params;
        this.collectionId = routeParams['collectionId'];
        this.eventFormId = routeParams['formId'];

        const queryParams = route.queryParams;
        const edit = queryParams['edit'] === 'true';
        this.birdAssociationId = queryParams['birdAssociationArea'];
        this.municipalityId = queryParams['municipality'];
        const activeNPId = queryParams['activeNP'];

        const user$ = this.userService.getUser();
        const eventForm$ = this.getEventForm$();
        return of([]).pipe(
            switchMap(() => {
                return forkJoin(
                    user$,
                    eventForm$.pipe(
                        mergeMap(res => {
                            const namedPlaces$ = this.getNamedPlaces$(res);
                            const placeFormId = res.namedPlaceOptions
                                && res.namedPlaceOptions.formID
                                || environment.namedPlaceForm;
                            const placeForm$ = this.getPlaceForm$(placeFormId);
                            return forkJoin(of(res), namedPlaces$, placeForm$);
                        })
                    )
                );
            }),
            mergeMap(res => {
                const formRights$ = this.getFormRights$();
                return forkJoin(of(res), formRights$);
            }),
            map(res => {
                const result: NPResolverData = {};
                result.collectionId = this.collectionId;
                result.edit = edit;
                result.user = res[0][0];
                result.formRights = res[1];
                result.eventForm = res[0][1][0];
                result.placeForm = res[0][1][2];
                result.namedPlaces = res[0][1][1];
                result.municipalityId = this.municipalityId;
                result.birdAssociationId = this.birdAssociationId;
                result.activeNPId = activeNPId;

                if (this.npRequirementsNotMet(result.eventForm)) {
                    result.namedPlaces = undefined;
                }

                return result;
            })
        );
    }

    getEventForm$(): Observable<any> {
        return this.formService.getForm(this.eventFormId, this.lang)
            .pipe(
                catchError((err) => {
                    const msgKey = err.status === 404
                        ? 'haseka.form.formNotFound'
                        : 'haseka.form.genericError';
                    return throwError(
                        this.translate.instant(msgKey, {formId: this.eventFormId})
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

    getNamedPlaces$(eventForm): Observable<any> {
        const query: NamedPlaceQuery = {
            collectionID: this.collectionId,
            municipality: this.municipalityId,
            birdAssociationArea: this.birdAssociationId,
            includeUnits: eventForm.namedPlaceOptions.includeUnits
        };

        if (this.npRequirementsNotMet(eventForm)) {
            return of([]);
        }

        return this.namedPlacesService.getAllNamePlaces(query)
            .pipe(
                catchError(() => {
                    return throwError(this.translate.instant('np.loadError'));
                })
            );
    }

    getFormRights$(): Observable<Rights> {
        return this.formPermissionService.getRights(this.eventFormId);
    }

    findLangFromRoute(_route: ActivatedRouteSnapshot) {
        let lang = 'fi';
        const routes: ActivatedRouteSnapshot[] = _route.pathFromRoot;
        for (const route of routes) {
            const data = route.data;
            if (data.lang) {
                lang = data.lang;
            }
        }
        return lang;
    }

    npRequirementsNotMet(eventForm) {
        return (
            (eventForm.features
            .includes('MHL.featureFilterNamedPlacesByMunicipality')
            && !this.municipalityId)
            || (eventForm.features
            .includes('MHL.featureFilterNamedPlacesByBirdAssociationArea')
            && !this.birdAssociationId)
        );
    }
}
