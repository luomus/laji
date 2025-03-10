/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../../../shared/service/user.service';
import { NamedPlace } from '../../../../shared/model/NamedPlace';
import { ToastsService } from '../../../../shared/service/toasts.service';
import { Util } from '../../../../shared/service/util.service';
import * as merge from 'deepmerge';
import { DialogService } from '../../../../shared/service/dialog.service';
import { Form } from '../../../../shared/model/Form';
import { NamedPlacesService } from '../../../../shared/service/named-places.service';
import { forkJoin, Observable, of } from 'rxjs';
import { map, mergeMap, switchMap, take } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { NamedPlacesQuery, NamedPlacesRouteData, ProjectFormService } from '../../../../shared/service/project-form.service';
import { AreaService } from '../../../../shared/service/area.service';
import { LajiFormFooterStatus } from 'projects/laji/src/app/+project-form/form/laji-form/laji-form-footer/laji-form-footer.component';
import { LajiFormComponent } from 'projects/laji/src/app/+project-form/form/laji-form/laji-form/laji-form.component';

interface ViewModel extends NamedPlacesRouteData {
  placeForm: Form.SchemaForm;
  description: string;
  formData: any;
}

@Component({
  selector: 'laji-np-edit-form',
  templateUrl: './np-edit-form.component.html',
  styleUrls: ['./np-edit-form.component.css']
})
export class NpEditFormComponent implements OnInit {
  asyncData$!: Observable<ViewModel>;

  lang?: string;
  saving = false;
  status: LajiFormFooterStatus = '';
  error = '';

  private hasChanges = false;
  private isPublic = false;

  @ViewChild(LajiFormComponent) lajiForm?: LajiFormComponent;

  constructor(
    private dialogService: DialogService,
    private userService: UserService,
    private namedPlaceService: NamedPlacesService,
    private translate: TranslateService,
    private toastsService: ToastsService,
    private route: ActivatedRoute,
    private projectFormService: ProjectFormService,
    private areaService: AreaService,
    private router: Router
  ) { }

  ngOnInit() {
    this.asyncData$ = this.projectFormService.getNamedPlacesRouteData$(this.route).pipe(
      mergeMap(data => this.getPlaceForm(data).pipe(
        map(placeForm => ({
            ...data,
            placeForm,
          formData: this.getFormData(data, placeForm),
          description: data.namedPlace
            ? data.documentForm.options?.namedPlaceOptions?.editDescription ?? 'np.defaultEditDescription'
            : data.documentForm.options?.namedPlaceOptions?.createDescription ?? 'np.defaultCreateDescription'
        })
        ))
      )
    );
  }

  @HostListener('window:beforeunload', ['$event'])
  preventLeave($event: any) {
    if (this.hasChanges) {
      this.translate.get('haseka.leave.unsaved')
        .subscribe((msg) =>  $event.returnValue = msg);
    }
  }

  onChange() {
    this.hasChanges = true;
    this.status = 'unsaved';
  }

  onSubmit(event: any) {
    if (!event.data.formData) {
      this.lajiForm!.unBlock();
      return;
    }

    this.saving = true;
    this.lajiForm!.block();
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
          this.lajiForm!.unBlock();
          this.saving = false;
          this.translate.get('np.form.success')
            .subscribe(value => {
              this.toastsService.showSuccess(value);
            });
          this.navigateToNPsView(result);
        },
        (err) => {
          this.lajiForm!.unBlock();
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
    this.lajiForm!.submit();
  }

  submitPrivate() {
    this.isPublic = false;
    this.lajiForm!.submit();
  }

  discard() {
    if (this.hasChanges) {
      this.dialogService.confirm(
        this.translate.instant('haseka.form.discardConfirm'),
        this.translate.instant('haseka.form.leaveConfirm.confirm')
      ).subscribe((confirmed) => confirmed && this.navigateToNPsView());
    } else {
      this.navigateToNPsView();
    }
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

  private getNamedPlaceData(event: any, asyncData: NamedPlacesRouteData) {
    const filteredKeys = ['placeWrapper'];

    const formData = event.data.formData;
    const data: any = {};

    const keys = Object.keys(formData);

    for (const key of keys) {
      if (formData[key] !== undefined && filteredKeys.indexOf(key) === -1) {
        data[key] = formData[key];
      }
    }

    if (asyncData.documentForm?.options?.namedPlaceOptions?.prepopulatedDocumentFields) {
      this.mergePrepopulatedDocument(data, formData, asyncData);
    }

    return Promise.resolve(data);
  }

  private mergePrepopulatedDocument(namedPlace: NamedPlace, formData: any, asyncData: NamedPlacesRouteData) {
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

  private parseErrorMessage(err: any) {
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

  getPlaceForm(data: NamedPlacesRouteData): Observable<Form.SchemaForm> {
    const getAreaEnum = (
      type: keyof Pick<AreaService, 'getMunicipalities' | 'getBiogeographicalProvinces' | 'getBirdAssociationAreas'>
    ): Observable<Form.IEnum> => (this.areaService[type](this.translate.currentLang)).pipe(
      map(areas => areas.reduce((schema: Form.IEnum, area: {id: string; value: string}) => {
        schema.oneOf.push({const: area.id, title: area.value});
        return schema;
      }, {oneOf: []}))
    );
    return this.projectFormService.getPlaceForm$(data.documentForm).pipe(switchMap(placeForm => forkJoin([
      placeForm!.schema.properties.municipality ? getAreaEnum('getMunicipalities') : of(null),
      placeForm!.schema.properties.biogeographicalProvince ? getAreaEnum('getBiogeographicalProvinces') : of(null),
      placeForm!.schema.properties.birdAssociationArea ? getAreaEnum('getBirdAssociationAreas') : of(null)
    ]).pipe(
      map(([municipalityEnum, biogeographicalProvinceEnum, birdAssociationAreaEnum]) => ({
        ...placeForm,
        uiSchemaContext: {
          ...(placeForm!.uiSchemaContext || {}),
          municipalityEnum,
          biogeographicalProvinceEnum,
          birdAssociationAreaEnum,
          isEdit: !!data.namedPlace
        }
      } as Form.SchemaForm))
    )
    ));
  }

  getFormData(data: NamedPlacesRouteData, placeForm: Form.SchemaForm) {
    const {namedPlace, documentForm, municipality, birdAssociationArea} = data;
    if (namedPlace) {
      const npData = Util.clone(namedPlace);

      if (npData.prepopulatedDocument && npData.prepopulatedDocument.gatherings && npData.prepopulatedDocument.gatherings[0]) {
        const gathering = npData.prepopulatedDocument.gatherings[0];
        if (gathering.locality) {
          npData['locality'] = gathering.locality;
        }
        if (gathering.localityDescription) {
          npData['localityDescription'] = gathering.localityDescription;
        }
      }

      return npData;
    } else {
      const prepopulatedNamedPlace = {} as any;
      const areas: Record<string, string|undefined> = {municipality, birdAssociationArea};
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
      prepopulatedNamedPlace.collectionID = documentForm.collectionID;
      return prepopulatedNamedPlace;
    }
  }
}
