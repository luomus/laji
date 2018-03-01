import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { NamedPlacesService } from '../named-places.service';
import { FormService } from '../../../shared/service/form.service';
import { NpChooseComponent } from '../np-choose/np-choose.component';
import { Observable } from 'rxjs/Observable';
import { FooterService } from '../../../shared/service/footer.service';
import { UserService } from '../../../shared/service/user.service';
import { NamedPlaceQuery } from '../../../shared/api/NamedPlaceApi';
import { Form } from '../../../shared/model/Form';
import { AreaType } from '../../../shared/service/area.service';
import { NpEditComponent } from '../np-edit/np-edit.component';
import {FormPermissionService, Rights} from '../../../+haseka/form-permission/form-permission.service';
import * as moment from 'moment';

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

  birdAssociationArea = '';
  municipality = '';

  errorMsg = '';

  private subParam: Subscription;
  private subTrans: Subscription;

  @ViewChild(NpChooseComponent) chooseView: NpChooseComponent;
  @ViewChild(NpEditComponent) editView: NpEditComponent;

  constructor(
    private route: ActivatedRoute,
    private namedPlaceService: NamedPlacesService,
    private formService: FormService,
    private footerService: FooterService,
    private translate: TranslateService,
    private userService: UserService,
    private formPermissionService: FormPermissionService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loading = true;
    this.subParam = this.route.params
      .switchMap((params) => {
        this.formId = params['formId'];
        this.collectionId = params['collectionId'];
        this.prepopulatedNamedPlace['collectionID'] = this.collectionId;

        return this.getFormInfo();
      })
      .switchMap((form) => this.updateSettings(form))
      .switchMap(() => this.updateNP())
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
    this.footerService.footerVisible = true;
  }

  updateBirdAssociationAreaFilter(value) {
    this.birdAssociationArea = value;
    this.prepopulatedNamedPlace['birdAssociationArea'] = [value];
    this.updateList();
  }

  updateMunicipalityFilter(value) {
    this.municipality = value;
    this.prepopulatedNamedPlace['municipality'] = [value];
    this.updateList();
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
      },() => {
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
      });
  }

  private updateNP(): Observable<any> {
    if (!this.collectionId) {
      return Observable.of([]);
    }
    const query: NamedPlaceQuery = {
      collectionID: this.collectionId
    };
    if (this.filterByMunicipality) {
      if (!this.municipality) {
        return Observable.of([]);
      }
      query.municipality = this.municipality;
    }
    if (this.filterByBirdAssociationArea) {
      if (!this.birdAssociationArea) {
        return Observable.of([]);
      }
      query.birdAssociationArea = this.birdAssociationArea;
    }
    return this.namedPlaceService.getAllNamePlaces(query)
      .catch(() => {
        this.translate.get('np.loadError')
          .subscribe(msg => (this.setErrorMessage(msg)));
        return Observable.of([]);
      })
      .do(data => {
        this.setActiveNP(-1);
        data.sort(this.sortFunction);
        this.namedPlaces = data
      });
  }

  private updateSettings(formData: any) {
    if (formData && formData.features && Array.isArray(formData.features)) {
      this.filterByBirdAssociationArea = formData.features.indexOf(Form.Feature.FilterNamedPlacesByBirdAssociationArea) > -1;
      this.filterByMunicipality = formData.features.indexOf(Form.Feature.FilterNamedPlacesByMunicipality) > -1;
      this.allowEdit = formData.features.indexOf(Form.Feature.NoEditingNamedPlaces) === -1
    }
    this.formRights = {
      admin: false,
      edit: false
    };
    this.allowCreate = false;
    if (!formData || !formData.collectionID || !this.userService.isLoggedIn) {
      return Observable.of(null);
    }
    return this.formPermissionService
      .getRights(formData)
      .take(1)
      .switchMap(rights => {
        this.formRights = rights;
        this.allowCreate = (formData.features && formData.features.indexOf(Form.Feature.NoNewNamedPlaces) === -1) || rights.admin;
        return Observable.of(null);
      });
  }

  private getFormInfo(): Observable<any> {
    return this.formService.getForm(this.formId, this.translate.currentLang)
      .catch((err) => {
        const msgKey = err.status === 404 ? 'haseka.form.formNotFound' : 'haseka.form.genericError';
        this.translate.get(msgKey, {formId: this.formId})
          .subscribe(msg => this.setErrorMessage(msg));
        return Observable.of({});
      })
      .do(form => this.formData = form);
  }

  setActiveNP(idx: number) {
    this.activeNP = idx;
    if (this.activeNP >= 0) {
      this.namedPlace = this.namedPlaces[this.activeNP];
      this.editView.npClick();
    } else {
      this.namedPlace = null;
    }
  }

  toEditMode(create: boolean) {
    if (create) {
      this.chooseView.setActiveNP(-1);
    }

    this.editMode = true;
  }

  toNormalMode(np: NamedPlace) {
    if (np) {
      if (this.activeNP >= 0) {
        this.namedPlaces[this.activeNP] = np;
        this.namedPlace = np;
      } else {
        this.namedPlaces.push(np);
        this.namedPlaces.sort(this.sortFunction);
      }
    }
    this.editMode = false;
  }

  setErrorMessage(msg) {
    this.errorMsg = msg;
  }

  private sortFunction(a, b) {
    let aa, bb;

    if (Number(a.alternativeID) && Number(b.alternativeID)) {
      aa = Number(a.alternativeID);
      bb = Number(b.alternativeID);
    } else {
      aa = a.name.toLowerCase();
      bb = b.name.toLowerCase();
    }

    return aa < bb ? -1 : aa > bb ? 1 : 0;
  }
}
