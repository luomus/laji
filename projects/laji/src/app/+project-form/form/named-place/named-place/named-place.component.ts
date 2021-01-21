import { catchError, map, mergeMap, pairwise, startWith, switchMap, take, tap } from 'rxjs/operators';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
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
import { FormService } from '../../../../shared/service/form.service';

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
  selector: 'laji-named-places',
  templateUrl: './named-place.component.html',
  styleUrls: ['./named-place.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NamedPlaceComponent implements OnInit, OnDestroy {

  @Input() set documentForm(documentForm: Form.SchemaForm) {
    this.documentForm$.next(documentForm);
  }

  @Input() set activeId(activeID: string) {
    this.activeNP$.next(activeID);
  }

  @Input() set municipality(municipality: string) {
    this.municipality$.next(municipality);
  }

  @Input() set birdAssociationArea(birdAssociationArea: string) {
    this.birdAssociationArea$.next(birdAssociationArea);
  }

  @Input() set tags(tags: string[]) {
    this.tags$.next(tags);
  }

  @Input() displayHeader = true;
  @Input() useLabel: string;
  @Input() readonly = false;
  @Input() useDisabled = false;
  @Input() reloadSubmissions$: Observable<void>;

  @Output() birdAssociationAreaChange = new EventEmitter<string>();
  @Output() municipalityChange = new EventEmitter<string>();
  @Output() tagsChange = new EventEmitter<string[]>();
  @Output() activeIdChange = new EventEmitter<string>();
  @Output() use = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();
  @Output() create = new EventEmitter<null>();

  constructor(
    private namedPlaceService: NamedPlacesService,
    private footerService: FooterService,
    private translate: TranslateService,
    private dialogService: DialogService,
    private userService: UserService,
    private toastrService: ToastrService,
    private formPermissionService: FormPermissionService,
    private projectFormService: ProjectFormService,
    private formService: FormService
  ) {}
  @ViewChild(NpChooseComponent) chooseView: NpChooseComponent;
  @ViewChild(NpInfoComponent) infoView: NpInfoComponent;

  vm$: Observable<DerivedFromInput>;

  areaTypes = Area.AreaType;
  loading = false;

  errorMsg = '';

  private updateFromInput: Subscription;
  private documentForm$ = new BehaviorSubject<Form.SchemaForm>(undefined);
  private activeNP$ = new BehaviorSubject<string>(undefined);
  private municipality$ = new BehaviorSubject<string>(undefined);
  private birdAssociationArea$ = new BehaviorSubject<string>(undefined);
  private tags$ = new BehaviorSubject<string[]>(undefined);

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
    const placeForm$ = this.documentForm$.pipe(switchMap(documentForm => this.formService.getPlaceForm(documentForm)));

    const activeNP$ = combineLatest(this.activeNP$, this.documentForm$, this.reloadNamedPlaces$).pipe(switchMap(([activeNP, documentForm]) =>
      this.namedPlaceService.getNamedPlace(activeNP, undefined, (documentForm.options?.namedPlaceOptions || {}).includeUnits)
    ));

    const namedPlaces$ = combineLatest(this.municipality$, this.birdAssociationArea$, this.tags$, this.documentForm$, this.reloadNamedPlaces$).pipe(
      tap(() => {
        this.loading = true;
      }),
      switchMap(([municipality, birdAssociationArea, tags, documentForm]) => this.getNamedPlaces$(documentForm, municipality, birdAssociationArea, tags)),
      tap(() => {
        this.loading = false;
      }),
    );
    const user$ = this.userService.user$;
    const formRights$ = this.documentForm$.pipe(switchMap(documentForm => this.formPermissionService.getRights(documentForm)));

    this.vm$ = combineLatest(this.documentForm$, placeForm$, this.municipality$, this.birdAssociationArea$, this.tags$, activeNP$, namedPlaces$, user$, formRights$).pipe(
      map(([
          documentForm,
          placeForm,
          municipality,
          birdAssociationArea,
          tags,
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
          allowEdit: (documentForm?.options?.namedPlaceOptions?.allowAddingPublic || formRights.admin) && !this.readonly,
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

  onBirdAssociationAreaChange(birdAssociationArea) {
    this.birdAssociationAreaChange.emit(birdAssociationArea);
  }

  onMunicipalityChange(municipality: string) {
    this.municipalityChange.emit(municipality);
  }

  onTagsChange(tags: string[]) {
    this.tagsChange.emit(tags);
  }

  onRelease(namedPlace: NamedPlace) {
    this.loading = true;
    this.namedPlaceService
      .releaseReservation(namedPlace.id)
      .subscribe(np => {
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
    )).subscribe(np => {
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
      this.activeIdChange.emit(activeNP);
    });
  }

  onEdit() {
    this.activeNP$.pipe(take(1)).subscribe(id => this.edit.emit(id));
  }

  onCreateNew() {
    this.create.emit();
  }

  useClick() {
    this.activeNP$.pipe(take(1)).subscribe(id => this.use.emit(id));
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
            this.activeId = null;
            this.activeIdChange.emit(null);
            this.reloadNamedPlaces$.next();
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
      municipality: municipality || 'all',
      birdAssociationArea,
      tags: (tags || []).join(','),
      includeUnits: documentForm.options?.namedPlaceOptions?.includeUnits,
      selectedFields: selected.filter(field => field.charAt(0) !== '_').join(',')
    };

    if (this.npRequirementsNotMet(documentForm, query.municipality, query.birdAssociationArea)) {
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
