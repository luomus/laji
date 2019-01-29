
import {catchError, filter} from 'rxjs/operators';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Router, Event, NavigationStart, NavigationError, NavigationEnd, NavigationCancel } from '@angular/router';
import { Subscription, of } from 'rxjs';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { NamedPlacesService } from '../named-places.service';
import { NpChooseComponent } from '../np-choose/np-choose.component';
import { FooterService } from '../../../shared/service/footer.service';
import { Form } from '../../../shared/model/Form';
import { AreaType } from '../../../shared/service/area.service';
import { NpEditComponent } from '../np-edit/np-edit.component';
import { Rights } from '../../../+haseka/form-permission/form-permission.service';
import * as moment from 'moment';
import { EventEmitter } from 'events';
import { Util } from '../../../shared/service/util.service';
import { NPResolverData } from '../named-place.resolver';
import { TranslateService } from '@ngx-translate/core';

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

  documentForm;
  placeForm: any;
  prepopulatedNamedPlace = {};

  namedPlaces: NamedPlace[];
  namedPlacesEvents = new EventEmitter;
  activeNP = -1;
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
  filterByTags = false;

  birdAssociationArea = '';
  municipality = '';
  taxonID = '';
  tags = '';

  errorMsg = '';

  mapOptionsData: any;
  lang: string;

  private subParam: Subscription;
  private routerEvents: Subscription;

  @ViewChild(NpChooseComponent) chooseView: NpChooseComponent;
  @ViewChild(NpEditComponent) editView: NpEditComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private namedPlaceService: NamedPlacesService,
    private footerService: FooterService,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.routerEvents = this.router.events.subscribe((event: Event) => {
      switch (true) {
        case event instanceof NavigationStart: {
          this.loading = true;
          break;
        }
        case event instanceof NavigationEnd:
        case event instanceof NavigationCancel:
        case event instanceof NavigationError: {
          this.loading = false;
          break;
        }
        default: {
          break;
        }
      }
    });

    this.subParam = this.route.data.pipe(catchError((err) => {
      this.setErrorMessage(err);
      return of({data: {}});
    })).subscribe((d) => {
      const data: NPResolverData = d.data;
      this.editMode = data.edit;
      this.collectionId = data.collectionId;
      this.formId = data.documentForm.id;
      this.userID = data.user.id;
      this.formRights = data.formRights;
      this.namedPlaces = data.namedPlaces;
      this.namedPlace = data.activeNP;
      this.birdAssociationArea = data.birdAssociationId;
      this.municipality = data.municipalityId;
      this.tags = data.tags;
      this.documentForm = data.documentForm;
      this.placeForm = data.placeForm;

      ['birdAssociationArea', 'municipality'].forEach(area => {
        if (this[area] && this[area].match(/^ML\.[0-9]+$/)) {
          this.prepopulatedNamedPlace[area] = [this[area]];
        } else {
          this.prepopulatedNamedPlace[area] = undefined;
        }
      });
      this.prepopulatedNamedPlace['collectionID'] = this.collectionId;

      this.setActiveNP(this.findNPIndexById(data.activeNPId));

      this.mapOptionsData = this.getMapOptions();
      this.updateSettings(data.documentForm);

      if (this.mapOptionsData) {
        data.placeForm['uiSchema']['geometry']['ui:options']['mapOptions'] = this.mapOptionsData;
      }
      this.setFormData();

      this.updateAllowCreate();

      this.cdr.markForCheck();
    });

    this.lang = this.translate.currentLang;

    this.footerService.footerVisible = false;
  }

  ngOnDestroy() {
    if (this.subParam) {
      this.subParam.unsubscribe();
    }
    if (this.routerEvents) {
      this.routerEvents.unsubscribe();
    }
    this.footerService.footerVisible = true;
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

  onTagChange(tags) {
    this.tags = tags.join(',');

    this.updateQueryParams();
  }

  onRelease() {
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

  onReserve() {
    this.loading = true;
    const {namedPlaceOptions = {}} = this.documentForm || {};
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

  private updateSettings(formData: any) {
    if (formData && formData.features && Array.isArray(formData.features)) {
      this.filterByBirdAssociationArea = formData.features.indexOf(Form.Feature.FilterNamedPlacesByBirdAssociationArea) > -1;
      this.filterByMunicipality = formData.features.indexOf(Form.Feature.FilterNamedPlacesByMunicipality) > -1;
      this.filterByTags = formData.features.indexOf(Form.Feature.FilterNamedPlacesByTags) > -1;
      this.allowEdit = formData.features.indexOf(Form.Feature.NoEditingNamedPlaces) === -1 || this.formRights.admin;
    }
  }

  updateAllowCreate() {
    this.allowCreate = this.formRights.admin ||
      (this.documentForm && this.documentForm.namedPlaceOptions && this.documentForm.namedPlaceOptions.requireAdmin === false);
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
    (this.tags || '').length > 0
      ? queryParams['tags'] = this.tags
      : delete queryParams['tags'];
    queryParams['edit'] = this.editMode;
    this.router.navigate([], { queryParams: queryParams });
  }

  onActivePlaceChange(idx: number) {
    this.setActiveNP(idx);
    this.updateQueryParams();
  }

  setActiveNP(idx: number) {
    this.activeNP = idx;
    if (this.activeNP >= 0 && this.editView) {
      this.editView.npClick();
    }
  }

  toEditMode(create: boolean) {
    if (!this.allowCreate) {
      return;
    }
    this.npEdit.setIsEdit(!create);
    this.editMode = true;
    if (create) {
      this.setActiveNP(-1);
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
    this.editMode = false;
    if (np) {
      this.setActiveNP(idx);
    }
    this.namedPlaceService.invalidateCache();
    this.updateQueryParams();
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

  setFormData() {
    if (!this.placeForm) {
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

      this.placeForm = {...this.placeForm, formData: npData};
    } else {
      this.placeForm = {...this.placeForm, formData: this.prepopulatedNamedPlace};
    }
  }

  private getMapOptions() {
    const uiSchema = this.documentForm.uiSchema;

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
