
import {tap, catchError,  switchMap, take } from 'rxjs/operators';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of as ObservableOf, Subscription, of } from 'rxjs';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { NamedPlacesService } from '../named-places.service';
import { FormService } from '../../../shared/service/form.service';
import { NpChooseComponent } from '../np-choose/np-choose.component';
import { FooterService } from '../../../shared/service/footer.service';
import { UserService } from '../../../shared/service/user.service';
import { NamedPlaceQuery } from '../../../shared/api/NamedPlaceApi';
import { Form } from '../../../shared/model/Form';
import { AreaType } from '../../../shared/service/area.service';
import { NpEditComponent } from '../np-edit/np-edit.component';
import { FormPermissionService, Rights } from '../../../+haseka/form-permission/form-permission.service';
import * as moment from 'moment';
import { EventEmitter } from 'events';
import { environment } from '../../../../environments/environment';
import { Util } from '../../../shared/service/util.service';
import { NPResolverData } from '../named-place.resolver';

@Component({
  selector: 'laji-named-place',
  templateUrl: './named-place.component.html',
  styleUrls: ['./named-place.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NamedPlaceComponent implements OnInit, OnDestroy {
  @ViewChild(NpEditComponent) npEdit: NpEditComponent;

  formId;
  collectionId;

  formData;
  prepopulatedNamedPlace = {};

  namedPlaces: NamedPlace[];
  namedPlacesEvents = new EventEmitter;
  activeNP = -1;
  preselectedNPIndex = -1;
  namedPlace: NamedPlace;

  userID: string;
  areaTypes = AreaType;
  editMode = false;
  loading = false;
  allowEdit = false;
  allowCreate = false;
  formRights: Rights = {
    admin: false,
    edit: false
  };

  filterByMunicipality = false;
  filterByBirdAssociationArea = false;

  birdAssociationArea = '';
  municipality = '';
  taxonID = '';

  errorMsg = '';

  editModeQParam: boolean;

  mapOptionsData: any;
  npFormData: any;
  lang: string;

  private subParam: Subscription;
  private subTrans: Subscription;
  private subQParams: Subscription;

  private npFormId: string;
  private npForm$: Subscription;

  @ViewChild(NpChooseComponent) chooseView: NpChooseComponent;
  @ViewChild(NpEditComponent) editView: NpEditComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private namedPlaceService: NamedPlacesService,
    private formService: FormService,
    private footerService: FooterService,
    private translate: TranslateService,
    private userService: UserService,
    private formPermissionService: FormPermissionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.data.pipe(catchError((err) => {
      this.setErrorMessage(err);
      return of({data: {}});
    })).subscribe((d) => {
      const data: NPResolverData = d.data;
      this.editMode = data.edit;
      this.collectionId = data.collectionId;
      this.formId = data.form.id;
      this.userID = data.user.id;
      this.namedPlaces = data.namedPlaces;
      this.birdAssociationArea = data.birdAssociationId;
      this.municipality = data.municipalityId;
      this.preselectedNPIndex = this.findNPIndexById(data.activeNPId);
      this.setActiveNP(this.preselectedNPIndex);

      // form
      this.formData = data.form;
      console.log(this.formData);
      this.npFormId = this.formData.namedPlaceOptions
        && this.formData.namedPlaceOptions.formID
        || environment.namedPlaceForm;
      this.mapOptionsData = this.getMapOptions();
      this.updateSettings(data.form).subscribe(() => {
        this.fetchForm();
        this.cdr.markForCheck();
      });

      this.cdr.markForCheck();
    });
/*     this.subQParams = this.route.queryParams.subscribe((params) => {
      const {municipality, birdAssociationArea, activeNP, edit} = params;
      this.birdAssociationArea = birdAssociationArea;
      this.municipality = municipality;
      if (this.birdAssociationArea) {
        this.prepopulatedNamedPlace['birdAssociationArea'] = [this.birdAssociationArea];
      }
      if (this.municipality) {
        this.prepopulatedNamedPlace['municipality'] = [this.municipality];
      }
      this.editModeQParam = edit === 'true';
      this.updateEditMode();
      const setIndex = () => {
        this.setActiveNP(this.findNPIndexById(activeNP));
        this.preselectedNPIndex = this.findNPIndexById(activeNP);
      };
      if (this.namedPlaces) {
        setIndex();
      } else {
        this.namedPlacesEvents.once('update', () => {
          setIndex();
        });
      }
      this.updateList();
      this.cdr.markForCheck();
    }); */

    this.loading = true;
    this.subParam = this.route.params.pipe(
      switchMap(() => {
        if (!(this.filterByMunicipality && !this.municipality)) {
          return this.updateNP();
        } else {
          return ObservableOf([]);
        }
      }))
      .subscribe(() => {
        this.loading = false;
        this.cdr.markForCheck();
      });

    this.subTrans = this.translate.onLangChange.subscribe(
      () => {
        this.onLangChange();
        this.cdr.markForCheck();
      }
    );

    this.footerService.footerVisible = false;
  }

  ngOnDestroy() {
    if (this.subParam) {
      this.subParam.unsubscribe();
    }
    if (this.subTrans) {
      this.subTrans.unsubscribe();
    }
    if (this.subQParams) {
      this.subQParams.unsubscribe();
    }
    this.footerService.footerVisible = true;
  }

  updateEditMode() {
    this.editMode = this.editModeQParam && this.formRights.admin;
  }

  onBirdAssociationAreaChange(value) {
    this.birdAssociationArea = value;
    this.updateQueryParams();
  }

  onMunicipalityChange(value: string) {
    if (value === undefined || value === 'undefined') {
      this.namedPlaces = undefined;
      this.municipality = '';
    } else {
      this.municipality = value;
    }
    this.updateQueryParams();
  }

  onTaxonSelect(e) {
    this.taxonID = e.key;
    this.updateQueryParams();
  }

  release() {
    this.loading = true;
    this.namedPlaceService
      .releaseReservation(this.namedPlace.id)
      .subscribe(np => {
        this.loading = false;
        this.namedPlace = np;
        this.updateNPInNPList(np);
        this.setFormData();
        this.cdr.markForCheck();
      }, () => {
        this.loading = false;
      });
  }

  reserve() {
    this.loading = true;
    const {namedPlaceOptions = {}} = this.formData || {};
    const until = namedPlaceOptions.reservationUntil;
    this.namedPlaceService
      .reserve(this.namedPlace.id, until ? {until: until.replace('${year}', moment().year())} : undefined)
      .subscribe(np => {
        this.loading = false;
        this.namedPlace = np;
        this.updateNPInNPList(np);
        this.cdr.markForCheck();
      }, () => {
        this.loading = false;
      });
  }

  updateNPInNPList(np: NamedPlace) {
    const idx = this.namedPlaces.findIndex(v => v.id === np.id);
    if (idx > -1) {
      this.namedPlaces[idx] = np;
      this.namedPlaces = [...this.namedPlaces];
    }
  }

  private updateList() {
    this.loading = true;
    this.updateNP()
      .subscribe(() => {
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  private updateNP(): Observable<any> {
    if (!this.collectionId) {
      return ObservableOf([]);
    }
    const query: NamedPlaceQuery = {
      collectionID: this.collectionId
    };
    if (this.filterByMunicipality) {
      query.municipality = this.municipality;
    }
    if (this.filterByBirdAssociationArea) {
      if (!this.birdAssociationArea) {
        return ObservableOf([]);
      }
      query.birdAssociationArea = this.birdAssociationArea;
    }
    const {namedPlaceOptions = {}} = this.formData;
    if (namedPlaceOptions.hasOwnProperty('includeUnits')) {
      query.includeUnits = namedPlaceOptions.includeUnits;
    }
    return this.namedPlaceService.getAllNamePlaces(query).pipe(
      catchError(() => {
        this.translate.get('np.loadError')
          .subscribe(msg => (this.setErrorMessage(msg)));
        return ObservableOf([]);
      })).pipe(
      tap(data => {
        this.namedPlaces = data;
        this.namedPlace = this.namedPlaces[this.activeNP];
        this.namedPlacesEvents.emit('update');
      }));
  }

  private updateSettings(formData: any) {
    if (formData && formData.features && Array.isArray(formData.features)) {
      this.filterByBirdAssociationArea = formData.features.indexOf(Form.Feature.FilterNamedPlacesByBirdAssociationArea) > -1;
      this.filterByMunicipality = formData.features.indexOf(Form.Feature.FilterNamedPlacesByMunicipality) > -1;
      this.allowEdit = formData.features.indexOf(Form.Feature.NoEditingNamedPlaces) === -1;
    }
    this.formRights = {
      admin: false,
      edit: false
    };
    this.allowCreate = false;
    return this.userService.isLoggedIn$.pipe(
      take(1),
      switchMap(login => {
        if (!formData || !formData.collectionID || !login) {
          return ObservableOf(null);
        }
        return this.formPermissionService
          .getRights(formData).pipe(
          take(1)).pipe(
          switchMap(rights => {
            this.formRights = rights;
            this.updateEditMode();
            if (this.formData && this.formData.namedPlaceOptions
                && this.formData.namedPlaceOptions.requireAdmin === false) {
              this.allowCreate = true;
            } else {
              this.allowCreate =  rights.admin && (!formData.features || formData.features.indexOf(Form.Feature.NoNewNamedPlaces) === -1);
            }
            return ObservableOf(null);
          }));
      })
    );
  }

  // deprecated
  private getFormInfo(): Observable<any> {
    return this.formService.getForm(this.formId, this.translate.currentLang).pipe(
      catchError((err) => {
        const msgKey = err.status === 404 ? 'haseka.form.formNotFound' : 'haseka.form.genericError';
        this.translate.get(msgKey, {formId: this.formId})
          .subscribe(msg => this.setErrorMessage(msg));
        return ObservableOf({});
      })).pipe(
      tap(form => {
        this.formData = form;
        this.npFormId = this.formData.namedPlaceOptions
          && this.formData.namedPlaceOptions.formID
          || environment.namedPlaceForm;
        this.mapOptionsData = this.getMapOptions();
        this.fetchForm();
      }));
  }

  updateQueryParams() {
    const queryParams = {};
    this.activeNP >= 0
      ? queryParams['activeNP'] = this.findNPIdByIndex(this.activeNP)
      : delete queryParams['activeNP'];
    (this.municipality || '').length > 0
      ? queryParams['municipality'] = this.municipality
      : delete queryParams['municipality'];
    (this.taxonID || '').length > 0
      ? queryParams['taxonID'] = this.taxonID
      : delete queryParams['taxonID'];
    (this.birdAssociationArea || '').length > 0
      ? queryParams['birdAssociationArea'] = this.birdAssociationArea
      : delete queryParams['birdAssociationArea'];
    queryParams['edit'] = this.editModeQParam;
    this.router.navigate([], { queryParams: queryParams });
  }

  onActivePlaceChange(idx: number) {
    this.setActiveNP(idx);
    this.updateQueryParams();
  }

  setActiveNP(idx: number) {
    this.activeNP = idx;
    this.preselectedNPIndex = idx;
    if (this.activeNP >= 0) {
      if (this.namedPlaces) { this.namedPlace = this.namedPlaces[this.activeNP]; }
      if (this.editView) { this.editView.npClick(); }
    } else {
      this.namedPlace = null;
    }
  }

  toEditMode(create: boolean) {
    if (!this.allowCreate) {
      return;
    }
    this.npEdit.setIsEdit(!create);
    this.editModeQParam = true;
    if (create) {
      this.setActiveNP(-1);
      this.preselectedNPIndex = -1;
    }
    this.updateQueryParams();
  }

  toNormalMode({np, isEdit}: {np?: NamedPlace, isEdit?: boolean} = {}) {
    let idx;
    if (np) {
      if (isEdit && this.activeNP >= 0) {
        idx = this.findNPIndexById(np.id);
        this.namedPlaces[idx] = np;
        this.namedPlace = np;
      } else {
        this.namedPlaces = [...this.namedPlaces, np];
        idx = this.namedPlaces.length - 1;
      }
    }
    this.editModeQParam = false;
    this.updateQueryParams();
    if (np) {
      this.setActiveNP(idx);
      this.preselectedNPIndex = idx;
    }
  }

  setErrorMessage(msg) {
    this.errorMsg = msg;
  }

  private findNPIdByIndex(idx: number) {
    return this.namedPlaces[idx].id;
  }

  private findNPIndexById(id: string) {
    if (!this.namedPlaces) {
      return -1;
    }
    return this.namedPlaces.findIndex((np) => {
      return np.id === id;
    });
  }

  onLangChange() {
    if (this.npForm$) {
      this.npForm$.unsubscribe();
    }
    const data = this.npFormData.formData;
    this.npFormData = null;
    this.npForm$ = this.formService
      .getForm(this.npFormId, this.translate.currentLang)
      .subscribe(form => {
        form['formData'] = data;
        if (this.mapOptionsData) {
          form['uiSchema']['geometry']['ui:options']['mapOptions'] = this.mapOptionsData;
        }
        this.lang = this.translate.currentLang;
        this.npFormData = form;
        this.cdr.markForCheck();
      });
  }

  fetchForm() {
    if (this.npForm$) {
      this.npForm$.unsubscribe();
    }
    this.lang = this.translate.currentLang;
    this.npForm$ = this.formService
      .load(this.npFormId, this.lang)
      .subscribe(
        data => {
          if (this.mapOptionsData) {
            data['uiSchema']['geometry']['ui:options']['mapOptions'] = this.mapOptionsData;
          }
          this.npFormData = data;
          console.log(this.formData, this.npFormData);
          this.setFormData();
          this.cdr.markForCheck();
        },
        err => {
          const msgKey = err.status === 404 ? 'haseka.form.formNotFound' : 'haseka.form.genericError';
          this.translate.get(msgKey, {formId: this.npFormId})
            .subscribe(msg => {
              this.setErrorMessage(msg);
              this.cdr.markForCheck();
            });
        }
      );
  }

  setFormData() {
    if (!this.npFormData) {
      return;
    }

    if (this.namedPlace) {
      const npData = Util.clone(this.namedPlace);

      npData['geometry'] = {type: 'GeometryCollection', geometries: [npData.geometry]};

      if (npData.prepopulatedDocument && npData.prepopulatedDocument.gatherings && npData.prepopulatedDocument.gatherings[0]) {
        const gathering = npData.prepopulatedDocument.gatherings[0];
        if (gathering.locality) {
          npData['locality'] = gathering.locality;
        }
        if (gathering.localityDescription) {
          npData['localityDescription'] = gathering.localityDescription;
        }
      }

      this.npFormData.formData = npData;
    } else {
      this.npFormData.formData = this.prepopulatedNamedPlace;
    }
  }

  private getMapOptions() {
    const uiSchema = this.formData.uiSchema;

    if (!uiSchema) {
      return null;
    }

    return this.findObjectByKey(uiSchema, 'mapOptions', ['gatherings', 'uiSchema', 'ui:options']);
  }

  private findObjectByKey(obj, key, allowedObjectsInPath, recursionLimit = 5) {
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
        foundObject = this.findObjectByKey(obj[i], key, allowedObjectsInPath, recursionLimit - 1);
      }

      if (foundObject !== null) {
        break;
      }
    }
    return foundObject;
  }

}
