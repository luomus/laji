import { catchError, map, pairwise, startWith, switchMap, take, tap } from 'rxjs/operators';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, of, Subscription, throwError } from 'rxjs';
import { NpChooseComponent } from '../np-choose/np-choose.component';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Form } from '../../../../shared/model/Form';
import { NamedPlace } from '../../../../shared/model/NamedPlace';
import { Area } from '../../../../shared/model/Area';
import { FormPermissionService, Rights } from '../../../../shared/service/form-permission.service';
import { NamedPlacesService } from '../../../../shared/service/named-places.service';
import { DialogService } from '../../../../shared/service/dialog.service';
import { UserService } from '../../../../shared/service/user.service';
import { FooterService } from '../../../../shared/service/footer.service';
import { NamedPlaceQuery } from '../../../../shared/api/NamedPlaceApi';
import { ProjectFormService, NamedPlacesQuery } from '../../../project-form.service';
import { NpInfoComponent } from '../np-info/np-info.component';

interface DerivedFromInput {
  collectionId?: string;
  documentForm?: Form.SchemaForm;
  placeForm?: Form.SchemaForm;
  namedPlaces?: any[];
  user?: any;
  formRights?: Rights;
  birdAssociationArea?: string;
  municipality?: string;
  tags?: string[];
  activeNP?: NamedPlace;
  description?: string;
  filterByBirdAssociationArea: boolean;
  filterByMunicipality: boolean;
  filterByTags: boolean;
  allowEdit: boolean;
  mapOptionsData: any;
  showMap: boolean;
}

@Component({
  selector: 'laji-named-place',
  templateUrl: './named-place.component.html',
  styleUrls: ['./named-place.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NamedPlaceComponent implements OnInit, OnDestroy {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private namedPlaceService: NamedPlacesService,
    private footerService: FooterService,
    private translate: TranslateService,
    private dialogService: DialogService,
    private userService: UserService,
    private toastrService: ToastrService,
    private formPermissionService: FormPermissionService,
    private projectFormService: ProjectFormService
  ) {}
  @ViewChild(NpChooseComponent) chooseView: NpChooseComponent;
  @ViewChild(NpInfoComponent) infoView: NpInfoComponent;

  documentForm$: Observable<Form.SchemaForm>;
  vm$: Observable<DerivedFromInput>;

  areaTypes = Area.AreaType;
  loading = false;

  errorMsg = '';

  private updateFromInput: Subscription;

  private reloadNamedPlaces$ = new BehaviorSubject<void>(undefined);

  static getMapOptions(documentForm: Form.SchemaForm) {
    const uiSchema = documentForm.uiSchema;

    if (!uiSchema) {
      return null;
    }

    return NamedPlaceComponent.findObjectByKey(uiSchema, 'mapOptions', ['gatherings', 'uiSchema', 'ui:options']);
  }

  private static findObjectByKey(obj, key, allowedObjectsInPath, recursionLimit = 5) {
    if (recursionLimit <= 0) {
      return null;
    }

    let foundObject = null;

    for (const i in obj) {
      if (!obj.hasOwnProperty(i) || typeof  obj[i] !== 'object') {
        continue;
      }

      if (i === key) {
        foundObject = obj[i];
      } else if (typeof obj[i] === 'object' && allowedObjectsInPath.indexOf(i) !== -1) {
        foundObject = NamedPlaceComponent.findObjectByKey(obj[i], key, allowedObjectsInPath, recursionLimit - 1);
      }

      if (foundObject !== null) {
        break;
      }
    }
    return foundObject;
  }

  ngOnInit() {
    const routeData$ = this.projectFormService.getNamedPlacesRouteData$(this.route);
    this.documentForm$ = routeData$.pipe(take(1), map(data => data.documentForm));
    const placeForm$ = routeData$.pipe(take(1), map(data => data.placeForm));

    const activeNP$ = combineLatest(routeData$, this.reloadNamedPlaces$).pipe(switchMap(([query]) =>
      this.namedPlaceService.getNamedPlace(query['activeNP'], undefined, (query.documentForm.options?.namedPlaceOptions || {}).includeUnits)
    ));

    const namedPlaces$ = combineLatest(routeData$, this.documentForm$, this.reloadNamedPlaces$).pipe(
      tap(() => {
        this.loading = true;
      }),
      switchMap(([params, documentForm]) => this.getNamedPlaces$(documentForm, params.municipality, params.birdAssociationArea, params.tags)),
      tap(() => {
        this.loading = false;
      }),
    );
    const user$ = this.userService.user$;
    const formRights$ = this.documentForm$.pipe(switchMap(documentForm => this.formPermissionService.getRights(documentForm)));

    this.vm$ = combineLatest(this.documentForm$, placeForm$, routeData$, activeNP$, namedPlaces$, user$, formRights$).pipe(
      map(([
          documentForm,
          placeForm,
          {birdAssociationArea, tags, municipality},
          activeNP,
          namedPlaces,
          user,
          formRights
        ]) => ({
          collectionId: documentForm.collectionID,
          documentForm,
          placeForm,
          namedPlaces,
          user,
          formRights,
          birdAssociationArea,
          municipality,
          tags,
          activeNP,
          description: documentForm.options?.namedPlaceOptions?.chooseDescription ?? 'np.defaultDescription',
          filterByBirdAssociationArea: documentForm?.options?.namedPlaceOptions?.filterByBirdAssociationArea,
          filterByMunicipality: documentForm?.options?.namedPlaceOptions?.filterByMunicipality,
          filterByTags: documentForm?.options?.namedPlaceOptions?.filterByTags,
          allowEdit: documentForm?.options?.namedPlaceOptions?.allowAddingPublic || formRights.admin,
          mapOptionsData: NamedPlaceComponent.getMapOptions(documentForm),
          showMap: !documentForm.options?.namedPlaceOptions?.hideMapTab
        }
      )),
    );

    this.updateFromInput = this.vm$.pipe(
      catchError(err => {
        this.setErrorMessage(err);
        return of({} as DerivedFromInput);
      }),
      startWith(null), pairwise()
    ).subscribe(([previousState, newState]) => {
      const {activeNP: prevActiveNP} = previousState || {};
      const {activeNP: newActiveNP} = newState;
      if (newActiveNP !== prevActiveNP && this.infoView) {
        this.infoView.npClick();
      } else if (prevActiveNP && !newActiveNP) {
        this.infoView.hide();
      }
    });

    this.footerService.footerVisible = false;
  }

  ngOnDestroy() {
    this.updateFromInput?.unsubscribe();
    this.footerService.footerVisible = true;
  }

  updateQuery(queryParams: Partial<NamedPlacesQuery>) {
    return this.router.navigate([], {queryParams, queryParamsHandling: 'merge'});
  }

  onBirdAssociationAreaChange(birdAssociationArea) {
    this.updateQuery({birdAssociationArea});
  }

  onMunicipalityChange(municipality: string) {
    this.updateQuery({municipality});
  }

  onTagChange(tags: string[]) {
    this.updateQuery({tags: tags.join(',')});
  }

  onRelease(namedPlace: NamedPlace) {
    this.loading = true;
    this.namedPlaceService
      .releaseReservation(namedPlace.id)
      .subscribe(() => {
        this.reloadNamedPlaces$.next();
        this.loading = false;
      }, () => {
        this.loading = false;
      });
  }

  onReserve(namedPlace: NamedPlace) {
    this.loading = true;
    this.documentForm$.pipe(switchMap(documentForm => {
        const until = documentForm?.options?.namedPlaceOptions?.reservationUntil;
        return this.namedPlaceService.reserve(
          namedPlace.id,
          until
          ? {until: until.replace('${year}', '' + moment().year())}
          : undefined
        );
      }
    )).subscribe(() => {
      this.reloadNamedPlaces$.next();
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

  onActivePlaceChange(activeNP: string) {
    this.vm$.pipe(take(1)).subscribe(({activeNP: _activeNP}) => {
      if (activeNP && activeNP === _activeNP?.id) {
        this.infoView.npClick();
      }
    });
    this.updateQuery({activeNP});
  }

  onEdit() {
    this.router.navigate([`./${this.route.snapshot.queryParams['activeNP']}/edit`], {relativeTo: this.route});
  }

  onCreateNew() {
    this.projectFormService.getProjectFormFromRoute$(this.route).pipe(take(1)).subscribe(projectForm => {
      this.router.navigate(['./new'], {
        queryParams: this.projectFormService.trimNamedPlacesQuery(projectForm.form, {
          municipality: this.route.snapshot.queryParams.municipality,
          birdAssociationArea: this.route.snapshot.queryParams.birdAssociationArea
        }, false),
        relativeTo: this.route
      });
    });
  }

  use() {
    this.router.navigate([`./${this.route.snapshot.queryParams['activeNP']}`], {relativeTo: this.route});
  }

  confirmDelete(namedPlace: NamedPlace) {
    this.translate.get('np.delete.confirm').pipe(
      switchMap(txt => this.dialogService.confirm(txt)),
      take(1),
    ).subscribe(result => {
        if (!result) {
          return;
        }
        this.namedPlaceService.deleteNamedPlace(namedPlace.id, this.userService.getToken()).subscribe(() => {
            this.updateQuery({activeNP: null}).then(() => {
              this.reloadNamedPlaces$.next();
            });
            this.translate.get('np.delete.success').subscribe(text => this.toastrService.success(text));
          },
          () => {
            this.translate.get('np.delete.fail').subscribe(text => this.toastrService.error(text));
          }
        );
      });
  }

  setErrorMessage(msg) {
    this.errorMsg = msg;
  }

  getNamedPlaces$(documentForm: Form.SchemaForm, municipality: string, birdAssociationArea: string, tags: string[]): Observable<any> {
    const selected = (documentForm.options?.namedPlaceOptions?.listColumns || ['$.name'])
      .map(field => field.replace('$.', '').replace(/\.length$/, ''));
    if (!documentForm.options?.namedPlaceOptions?.hideMapTab) {
      selected.push('geometry');
    }
    if (documentForm.options?.restrictAccess && selected.indexOf('reserve') === -1) {
      selected.push('reserve');
    }

    const query: NamedPlaceQuery = {
      collectionID: documentForm.collectionID,
      municipality,
      birdAssociationArea,
      tags: (tags || []).join(','),
      includeUnits: documentForm.options?.namedPlaceOptions?.includeUnits,
      selectedFields: selected.filter(field => field.charAt(0) !== '_').join(',')
    };

    if (this.npRequirementsNotMet(documentForm, municipality, birdAssociationArea)) {
      return of(null);
    }

    return this.namedPlaceService.getAllNamePlaces(query)
      .pipe(
        catchError(() => {
          return throwError(this.translate.instant('np.loadError'));
        })
      );
  }

  npRequirementsNotMet(documentForm: Form.SchemaForm, municipality: string, birdAssociationArea: string) {
    return (documentForm.options?.namedPlaceOptions?.filterByMunicipality && !municipality)
      || (documentForm.options?.namedPlaceOptions?.filterByBirdAssociationArea && !birdAssociationArea);
  }
}
