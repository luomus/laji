import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of, forkJoin, throwError } from 'rxjs';
import { mergeMap, map, catchError } from 'rxjs/operators';
import { NamedPlacesService } from './named-places.service';
import { NamedPlaceQuery } from 'app/shared/api/NamedPlaceApi';
import { FormService } from 'app/shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'app/shared/service/user.service';

export interface NPResolverData {
    collectionId?: string;
    edit?: boolean;

    form?: any;
    namedPlaces?: any[];
    user?: any;

    birdAssociationId?: string;
    municipalityId?: string;
    activeNPId?: any;
}

@Injectable()
export class NamedPlaceResolver implements Resolve<Observable<NPResolverData>> {
    private collectionId;
    private formId;
    private birdAssociationId;
    private municipalityId;
    constructor(private formService: FormService,
                private translate: TranslateService,
                private namedPlacesService: NamedPlacesService,
                private userService: UserService) {}
    resolve(route: ActivatedRouteSnapshot) {
        const routeParams = route.params;
        this.collectionId = routeParams['collectionId'];
        this.formId = routeParams['formId'];

        const queryParams = route.queryParams;
        const edit = queryParams['edit'];
        this.birdAssociationId = queryParams['birdAssociationArea'];
        this.municipalityId = queryParams['municipality'];
        const activeNPId = queryParams['activeNP'];

        const user$ = this.userService.getUser();
        const form$ = this.getForm$();

        return forkJoin(
            user$,
            form$.pipe(
                catchError((err) => {
                    const msgKey = err.status === 404
                        ? 'haseka.form.formNotFound'
                        : 'haseka.form.genericError';
                    return throwError(this.translate.instant(msgKey, {formId: this.formId}));
                }),
                mergeMap(res => {
                    const namedPlaces$ = this.getNamedPlaces$(res.namedPlaceOptions);
                    return forkJoin(of(res), namedPlaces$);
                }),
                catchError(() => {
                    return throwError(this.translate.instant('np.loadError'));
                })
            )
        ).pipe(map(res => {
            const result: NPResolverData = {};
            result.collectionId = this.collectionId;
            result.edit = edit;
            result.user = res[0];
            result.form = res[1][0];
            result.namedPlaces = res[1][1];
            result.municipalityId = this.municipalityId;
            result.birdAssociationId = this.birdAssociationId;
            result.activeNPId = activeNPId;
            return result;
        }));
    }

    getForm$(): Observable<any> {
        return this.formService.getForm(this.formId, this.translate.currentLang);
    }

    getNamedPlaces$(namedPlaceOptions = { includeUnits: false }): Observable<any> {
        delete namedPlaceOptions.includeUnits;
        const query: NamedPlaceQuery = {
            collectionID: this.collectionId,
            municipality: this.municipalityId,
            birdAssociationArea: this.birdAssociationId,
            includeUnits: namedPlaceOptions.includeUnits
        };
        return this.namedPlacesService.getAllNamePlaces(query);
    }
}
