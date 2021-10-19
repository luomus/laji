import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LajiFormComponent } from '@laji-form/laji-form/laji-form.component';
import { UserService } from '../../../../shared/service/user.service';
import { NamedPlace } from '../../../../shared/model/NamedPlace';
import { ToastsService } from '../../../../shared/service/toasts.service';
import { Util } from '../../../../shared/service/util.service';
import * as merge from 'deepmerge';
import { DialogService } from '../../../../shared/service/dialog.service';
import { Form } from '../../../../shared/model/Form';
import { NamedPlacesService } from '../../../../shared/service/named-places.service';
import { forkJoin, Observable, of } from 'rxjs';
import { map, mergeMap, take } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { NamedPlaceComponent } from '../named-place/named-place.component';
import { NamedPlacesQuery, NamedPlacesRouteData, ProjectFormService } from '../../../project-form.service';
import { AreaService } from '../../../../shared/service/area.service';
import { BrowserService } from '../../../../shared/service/browser.service';

interface NamedPlacesRouteDataWithPlaceForm extends NamedPlacesRouteData {
  placeForm: Form.SchemaForm;
}

interface ViewModel extends NamedPlacesRouteDataWithPlaceForm {
  description: string;
}

@Component({
  selector: 'laji-np-edit-form',
  templateUrl: './np-edit-form.component.html',
  styleUrls: ['./np-edit-form.component.css']
})
export class NpEditFormComponent implements OnInit {
  asyncData$: Observable<ViewModel>;

  lang: string;
  saving = false;
  status = '';
  error = '';

  private hasChanges = false;
  private isPublic = false;

  @ViewChild(LajiFormComponent) lajiForm: LajiFormComponent;

  constructor(
    private dialogService: DialogService,
    private userService: UserService,
    private namedPlaceService: NamedPlacesService,
    private translate: TranslateService,
    private toastsService: ToastsService,
    private route: ActivatedRoute,
    private projectFormService: ProjectFormService,
    private areaService: AreaService,
    private browserService: BrowserService,
    private router: Router
  ) { }

  ngOnInit() {
    this.asyncData$ = this.projectFormService.getNamedPlacesRouteData$(this.route).pipe(
      mergeMap(data => this.projectFormService.getPlaceForm$(data.documentForm).pipe(
        mergeMap(_placeForm => this.populateAndDecorateNPForm({...data, placeForm: _placeForm}).pipe(
          map(placeForm => ({
            ...data,
            placeForm,
            description: data.namedPlace
               ? data.documentForm.options?.namedPlaceOptions?.editDescription ?? 'np.defaultEditDescription'
               : data.documentForm.options?.namedPlaceOptions?.createDescription ?? 'np.defaultCreateDescription'
          })),
        ))
      ))
    );
  }

  @HostListener('window:beforeunload', ['$event'])
  preventLeave($event) {
    if (this.hasChanges) {
      this.translate.get('haseka.leave.unsaved')
        .subscribe((msg) =>  $event.returnValue = msg);
    }
  }

  onChange() {
    this.hasChanges = true;
    this.status = 'unsaved';
  }

  onSubmit(event) {
    if (!event.data.formData) {
      this.lajiForm.unBlock();
      return;
    }

    this.saving = true;
    this.lajiForm.block();
    this.asyncData$.pipe(take(1)).subscribe(asyncData =>
    this.getNamedPlaceData(event, asyncData).then(data => {
      data.public = this.isPublic;

      let result$;
      if (asyncData.namedPlace) {
        result$ = this.namedPlaceService.updateNamedPlace(data.id, data, this.userService.getToken());
      } else {
        result$ = this.namedPlaceService.createNamedPlace(data, this.userService.getToken());
      }

      result$.subscribe(
        (result) => {
          this.lajiForm.unBlock();
          this.saving = false;
          this.translate.get('np.form.success')
            .subscribe(value => {
              this.toastsService.showSuccess(value);
            });
          this.navigateToNPsView(result);
        },
        (err) => {
          this.lajiForm.unBlock();
          this.saving = false;
          this.status = 'error';
          this.error = this.parseErrorMessage(err);

          setTimeout(() => {
            if (this.status === 'error') {
              this.status = '';
            }
          }, 5000);
        });
    })
  );
  }

  submitPublic() {
    this.isPublic = true;
    this.lajiForm.submit();
  }

  submitPrivate() {
    this.isPublic = false;
    this.lajiForm.submit();
  }

  discard() {
    this.hasChanges
      ? this.dialogService.confirm(this.translate.instant('haseka.form.discardConfirm'), this.translate.instant('haseka.form.leaveConfirm.confirm')).subscribe(() => this.navigateToNPsView())
      : this.navigateToNPsView();
  }

  navigateToNPsView(_namedPlace?: NamedPlace) {
    this.asyncData$.pipe(take(1)).subscribe(data => {
      const namedPlace = _namedPlace || data.namedPlace;
      let levels = 1;
      if (data.namedPlace) {
        levels++;
      }
      const queryParams: NamedPlacesQuery = {
        activeNP: namedPlace?.id || data.namedPlace?.id
      };
      if (data.documentForm.options?.namedPlaceOptions?.filterByMunicipality) {
        queryParams.municipality = namedPlace?.municipality?.join(',') || data.municipality;
      }
      if (data.documentForm.options?.namedPlaceOptions?.filterByBirdAssociationArea) {
        queryParams.birdAssociationArea = namedPlace?.birdAssociationArea?.join(',') || data.birdAssociationArea;
      }
      if (data.documentForm.options?.namedPlaceOptions?.filterByTags) {
        queryParams.tags = (data.tags || []).join(',');
      }
      this.router.navigate(
        [new Array(levels).fill('..').join('/')],
        {
          relativeTo: this.route,
          replaceUrl: true,
          queryParams
        }
      );
    });
  }

  private getNamedPlaceData(event, asyncData: NamedPlacesRouteData) {
    const filteredKeys = ['placeWrapper'];

    const formData = event.data.formData;
    const data: any = {};

    const keys = Object.keys(formData);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (formData[key] !== undefined && filteredKeys.indexOf(key) === -1) {
        data[key] = formData[key];
      }
    }

    if (asyncData.documentForm?.options?.namedPlaceOptions?.prepopulatedDocumentFields) {
      this.mergePrepopulatedDocument(data, formData, asyncData);
    }

    return Promise.resolve(data);
  }

  private mergePrepopulatedDocument(namedPlace, formData, asyncData: NamedPlacesRouteData) {
    namedPlace.prepopulatedDocument = asyncData.namedPlace?.prepopulatedDocument;
    if (formData.prepopulatedDocument) {
      namedPlace.prepopulatedDocument = merge(
        namedPlace.prepopulatedDocument || {},
        formData.prepopulatedDocument,
        { arrayMerge: Util.arrayCombineMerge }
      );
    }
    return namedPlace;
  }

  private parseErrorMessage(err) {
    let detail = 'Error! ', data;
    if (err._body) {
      try {
        data = JSON.parse(err._body);

        if (data.error) {
          if (data.error.detail) {
            detail = data.error.detail;
          } else if (data.error.message) {
            detail += data.error.message;
          }
        }
      } catch (e) {}
    }
    return detail;
  }

  private populateAndDecorateNPForm(data: NamedPlacesRouteDataWithPlaceForm) {
    const {placeForm, namedPlace, documentForm, municipality, birdAssociationArea} = data;
    const mapOptions = NamedPlaceComponent.getMapOptions(data.documentForm);
    if (mapOptions) {
      try {
        placeForm['uiSchema']['geometry']['ui:options']['mapOptions'] = mapOptions;
      } catch (e) {
        console.warn('Setting uiSchema map options failed.');
      }
    }
    const getAreaEnum = (
      type: keyof Pick<AreaService, 'getMunicipalities' | 'getBiogeographicalProvinces' | 'getBirdAssociationAreas'>
    ): Observable<Form.IEnum> => (this.areaService[type](this.translate.currentLang)).pipe(
      map(areas => areas.reduce((enums, area) => {
        enums.enum.push(area.id);
        enums.enumNames.push(area.value);
        return enums;
      }, { enum: [], enumNames: [] }))
    );
    const placeFormWithFormData = this.getNamedPlaceFormWithFormData(placeForm, namedPlace, municipality, birdAssociationArea, documentForm.collectionID);
    const {properties} = placeForm.schema;
    return forkJoin([
      properties.municipality ? getAreaEnum('getMunicipalities') : of(null),
      properties.biogeographicalProvince ? getAreaEnum('getBiogeographicalProvinces') : of(null),
      properties.birdAssociationArea ? getAreaEnum('getBirdAssociationAreas') : of(null)
      ]
    ).pipe(
      map(([municipalityEnum, biogeographicalProvinceEnum, birdAssociationAreaEnum]) => ({
        ...placeFormWithFormData,
        uiSchemaContext: {
          ...(placeFormWithFormData.uiSchemaContext || {}),
          municipalityEnum,
          biogeographicalProvinceEnum,
          birdAssociationAreaEnum,
          isEdit: !!data.namedPlace
        }
      })),
    );
  }

  getNamedPlaceFormWithFormData(placeForm: Form.SchemaForm, namedPlace: NamedPlace, municipality: string, birdAssociationArea: string, collectionID: string) {
    if (namedPlace) {
      const npData = Util.clone(namedPlace);

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

      return {...placeForm, formData: npData};
    } else {
      const prepopulatedNamedPlace = {} as any;
      const areas = {municipality, birdAssociationArea};
      ['birdAssociationArea', 'municipality'].forEach(area => {
        if (!placeForm.schema.properties[area]) {
          return;
        }
        if (areas[area]?.match(/^ML\.[0-9]+$/)) {
          prepopulatedNamedPlace[area] = [areas[area]];
        } else {
          prepopulatedNamedPlace[area] = undefined;
        }
      });
      prepopulatedNamedPlace.collectionID = collectionID;
      return {...placeForm, formData: prepopulatedNamedPlace};
    }
  }
}
