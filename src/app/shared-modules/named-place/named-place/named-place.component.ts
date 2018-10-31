import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of as ObservableOf, Subscription } from 'rxjs';
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
import { switchMap, take } from 'rxjs/operators';
import { EventEmitter } from 'events';

@Component({
  selector: 'laji-named-place',
  templateUrl: './named-place.component.html',
  styleUrls: ['./named-place.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NamedPlaceComponent implements OnInit, OnDestroy {
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

  listenToNextParamChange = true;

  filterByMunicipality = false;
  filterByBirdAssociationArea = false;

  birdAssociationArea = '';
  municipality = '';
  taxonID = '';

  errorMsg = '';

  _editModeInit: string;
  _formRightsInit = false;

  private subParam: Subscription;
  private subTrans: Subscription;
  private subQParams: Subscription;

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
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.subQParams = this.route.queryParams.subscribe((params) => {
      if (this.listenToNextParamChange) {
        let updateList = false;
        if (params.taxonID) {
          this.taxonID = params.taxonID;
          updateList = true;
        }
        if (params.municipality) {
          this.updateMunicipalityFilter(params.municipality);
        }
        if (params.birdAssociationArea) {
          this.birdAssociationArea = params.birdAssociationArea;
          updateList = true;
        }
        if (params.activeNP) {
          this.namedPlacesEvents.once('update', () => {
            this.setActiveNP(this.findNPIndexById(params.activeNP));
            this.preselectedNPIndex = this.findNPIndexById(params.activeNP);
          });
          updateList = true;
        } else {
          this.setActiveNP(-1);
          this.preselectedNPIndex = -1;
        }
        this._editModeInit = params.edit;
        this.initEditMode();
        if (updateList) { this.updateList() }
        this.cd.markForCheck();
      }
      this.listenToNextParamChange = true;
    });

    this.loading = true;
    this.subParam = this.route.params
      .switchMap((params) => {
        this.formId = params['formId'];
        this.collectionId = params['collectionId'];
        this.prepopulatedNamedPlace['collectionID'] = this.collectionId;

        return this.getFormInfo();
      })
      .switchMap((form) => this.updateSettings(form))
      .switchMap(() => {
        if (!(this.filterByMunicipality && !this.municipality)) {
          return this.updateNP();
        } else {
          return ObservableOf([]);
        }
      })
      .subscribe(() => {
        this.loading = false;
        this.cd.markForCheck();
      });
    this.userService.getUser()
      .subscribe(person => this.userID = person.id);

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

  initEditMode() {
    if (!this._editModeInit || !this._formRightsInit) {
      return;
    }
    if (this.formRights.admin && this._editModeInit === 'true') {
      this.editMode = true;
    } else {
      this.editMode = false;
    }
  }

  updateBirdAssociationAreaFilter(value) {
    this.birdAssociationArea = value;
    this.prepopulatedNamedPlace['birdAssociationArea'] = [value];
    this.updateList();
    this.updateQueryParams();
  }

  updateMunicipalityFilter(value: string) {
    if (value === undefined) {
      this.namedPlaces = undefined;
      this.municipality = '';
      this.updateMunicipalityParam();
      return;
    }
    this.municipality = value;
    if (value.match(/^ML\..+/)) {
      this.prepopulatedNamedPlace['municipality'] = [value];
    }
    this.updateMunicipalityParam();
    this.updateList();
  }

  onTaxonSelect(e) {
    this.taxonID = e.key;
    this.prepopulatedNamedPlace['taxonIDs'] = [this.taxonID];
    this.updateList();
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
        this.cd.markForCheck();
      }, () => {
        this.loading = false;
      })
  }

  reserve() {
    this.loading = true;
    const namedPlaceOptions = this.formData.namedPlaceOptions || {};
    const until = namedPlaceOptions.reservationUntil;
    this.namedPlaceService
      .reserve(this.namedPlace.id, until ? {until: until.replace('${year}', moment().year())} : undefined)
      .subscribe(np => {
        this.loading = false;
        this.namedPlace = np;
        this.updateNPInNPList(np);
        this.cd.markForCheck();
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
        this.cd.markForCheck();
        const params = this.route.snapshot.queryParams;
        if (params['activeNP']) {
          const index = this.findNPIndexById(params['activeNP']);
          this.setActiveNP(index);
          this.preselectedNPIndex = index;
        }
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
      query.includeUnits = namedPlaceOptions.includeUnits
    }
    return this.namedPlaceService.getAllNamePlaces(query)
      .catch(() => {
        this.translate.get('np.loadError')
          .subscribe(msg => (this.setErrorMessage(msg)));
        return ObservableOf([]);
      })
      .do(data => {
        data.sort(this.sortFunction);
        this.namedPlaces = data;
        this.namedPlace = this.namedPlaces[this.activeNP];
        this.namedPlacesEvents.emit('update');
      });
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
          .getRights(formData)
          .take(1)
          .switchMap(rights => {
            this._formRightsInit = true;
            this.initEditMode();
            this.formRights = rights;
            if (this.formData && this.formData.namedPlaceOptions && this.formData.namedPlaceOptions.requireAdmin === false) {
              this.allowCreate = true;
            } else {
              this.allowCreate =  rights.admin && (!formData.features || formData.features.indexOf(Form.Feature.NoNewNamedPlaces) === -1);
            }
            return ObservableOf(null);
          })
      })
    );
  }

  private getFormInfo(): Observable<any> {
    return this.formService.getForm(this.formId, this.translate.currentLang)
      .catch((err) => {
        const msgKey = err.status === 404 ? 'haseka.form.formNotFound' : 'haseka.form.genericError';
        this.translate.get(msgKey, {formId: this.formId})
          .subscribe(msg => this.setErrorMessage(msg));
        return ObservableOf({});
      })
      .do(form => this.formData = form);
  }

  updateMunicipalityParam() {
    const sub = this.route.queryParams.subscribe((params) => {
      const queryParams = {...params};
      this.municipality.length > 0 ? queryParams['municipality'] = this.municipality
      : delete queryParams['municipality'];
      this.listenToNextParamChange = false;
      this.router.navigate([], { queryParams: queryParams });
      sub.unsubscribe();
    });
  }

  updateQueryParams() {
    const queryParams = {};
    this.activeNP >= 0 ? queryParams['activeNP'] = this.findNPIdByIndex(this.activeNP)
      : delete queryParams['activeNP'];
    this.municipality.length > 0 ? queryParams['municipality'] = this.municipality
      : delete queryParams['municipality'];
    this.taxonID.length > 0 ? queryParams['taxonID'] = this.taxonID
      : delete queryParams['taxonID'];
    this.birdAssociationArea.length > 0 ? queryParams['birdAssociationArea'] = this.birdAssociationArea
      : delete queryParams['birdAssociationArea'];
    queryParams['edit'] = this.editMode;
    this.listenToNextParamChange = false;
    this.router.navigate([], { queryParams: queryParams });
  }

  onActivePlaceChange(idx: number) {
    this.setActiveNP(idx);
    this.updateQueryParams();
  }

  onTabChange(e) {
    const sub = this.route.queryParams.subscribe((params) => {
      if (params['activeNP']) {
        const index = this.findNPIndexById(params['activeNP']);
        this.setActiveNP(index);
        this.preselectedNPIndex = index;
      }
      sub.unsubscribe();
    });
  }

  setActiveNP(idx: number) {
    this.activeNP = idx;
    if (this.activeNP >= 0) {
      if (this.namedPlaces) { this.namedPlace = this.namedPlaces[this.activeNP] }
      if (this.editView) { this.editView.npClick() }
    } else {
      this.namedPlace = null;
    }
  }

  toEditMode(create: boolean) {
    if (!this.formRights.admin) {
      return;
    }
    this.editMode = true;
    if (create) {
      this.setActiveNP(-1);
      this.preselectedNPIndex = -1;
    }
    this.updateQueryParams();
  }

  toNormalMode(np: NamedPlace) {
    if (np) {
      if (this.activeNP >= 0) {
        this.namedPlaces[this.activeNP] = np;
        this.namedPlace = np;
      } else {
        this.namedPlaces.push(np);
        this.namedPlaces.sort(this.sortFunction);
        this.namedPlaces = [...this.namedPlaces];
      }
    }
    this.editMode = false;
    this.updateQueryParams();
    if (np) {
      this.setActiveNP(this.findNPIndexById(np.id));
      this.preselectedNPIndex = this.findNPIndexById(np.id);
    }
  }

  setErrorMessage(msg) {
    this.errorMsg = msg;
  }

  private sortFunction(a, b) {
    let aa, bb;

    aa = a.name.toLowerCase();
    bb = b.name.toLowerCase();

    return aa < bb ? -1 : aa > bb ? 1 : 0;
  }

  private findNPIdByIndex(idx: number) {
    return this.namedPlaces[idx].id;
  }

  private findNPIndexById(id: string) {
    return this.namedPlaces.findIndex((np) => {
      return np.id === id;
    });
  }
}
