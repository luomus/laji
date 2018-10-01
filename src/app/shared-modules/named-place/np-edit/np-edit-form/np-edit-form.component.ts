import { Component, EventEmitter, HostListener, Inject, Input, Output, ViewChild } from '@angular/core';
import { WINDOW } from '@ng-toolkit/universal';
import { TranslateService } from '@ngx-translate/core';
import { LajiFormComponent } from '@laji-form/laji-form/laji-form.component';
import { UserService } from '../../../../shared/service/user.service';
import { NamedPlacesService } from '../../named-places.service';
import { NamedPlace } from '../../../../shared/model/NamedPlace';
import { ToastsService } from '../../../../shared/service/toasts.service';
import { Util } from '../../../../shared/service/util.service';
import { TaxonomyApi } from '../../../../shared/api/TaxonomyApi';
import { AreaService } from '../../../../shared/service/area.service';

@Component({
  selector: 'laji-np-edit-form',
  templateUrl: './np-edit-form.component.html',
  styleUrls: ['./np-edit-form.component.css']
})
export class NpEditFormComponent {
  @Input() lang: string;
  @Input() formData: any;
  @Input() namedPlace: NamedPlace;
  @Output() onEditReady = new EventEmitter<NamedPlace>();

  tick = 0;
  saving = false;
  status = '';
  error = '';

  private hasChanges = false;
  private isPublic = false;

  @ViewChild(LajiFormComponent) lajiForm: LajiFormComponent;

  constructor(@Inject(WINDOW) private window: Window,
    private  userService: UserService,
    private namedPlaceService: NamedPlacesService,
    private translate: TranslateService,
    private toastsService: ToastsService,
    private taxonomyApi: TaxonomyApi,
    private areaService: AreaService
  ) { }

  @HostListener('window:beforeunload', ['$event'])
  preventLeave($event) {
    if (this.hasChanges) {
      this.translate.get('haseka.leave.unsaved')
        .subscribe((msg) =>  $event.returnValue = msg);
    }
  }

  onChange(event) {
    this.hasChanges = true;
    this.status = 'unsaved';
  }

  onSubmit(event) {
    if (!('namedPlace' in event.data.formData) || event.data.formData.namedPlace.length < 1) {
      this.lajiForm.unBlock();
      return;
    }

    this.saving = true;
    this.lajiForm.block();
    this.getNamedPlaceData(event).then(data => {
        data.public = this.isPublic;

        let result$;
        if (this.namedPlace) {
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
            this.onEditReady.emit(result);
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
    });
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
    this.translate.get('haseka.form.discardConfirm').subscribe(
      (confirm) => {
        if (!this.hasChanges) {
          this.onEditReady.emit();
        } else if (this.window.confirm(confirm)) {
          this.onEditReady.emit();
        }
      }
    );
  }

  private getNamedPlaceData(event) {
    const filteredKeys = ['geometry', 'locality', 'localityDescription', 'placeWrapper'];

    const formData = event.data.formData.namedPlace[0];
    const data: any = {};

    const keys = Object.keys(formData);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (formData[key] !== undefined && filteredKeys.indexOf(key) === -1) {
        data[key] = formData[key];
      }
    }

    data.geometry = formData.geometry.geometries[0];

    this.localityToPrepopulatedDocument(data, formData);

    if (this.formData.namedPlaceOptions && this.formData.namedPlaceOptions.prepopulatedDocumentFields) {
      return this.augmnentPrepopulatedDocument(data, formData, this.formData.namedPlaceOptions.prepopulatedDocumentFields);
    }

    return Promise.resolve(data);
  }

  private getPrepopulatedDocument(namedPlace) {
    namedPlace.prepopulatedDocument =
      (this.namedPlace && this.namedPlace.prepopulatedDocument) ? this.namedPlace.prepopulatedDocument : {};
    return namedPlace;
  }

  /**
   * options (form namedPlaceOptions.prepopulatedDocumentFields) structure is as follows:
   * {[JSON Pointer to field in document]: [JSON Pointer to field in namedPlace] | {
   *   fn: <oneof> "join"', "taxon", "area"
   *   <...additional params for fn, see the fns below>
   * }
   */
  private augmnentPrepopulatedDocument(namedPlace, formData, options) {
    const fns = {
      join: ({from, delimiter = ', '}) => {
        return Util.parseJSONPointer(formData, from).join(delimiter);
      },
      taxon: ({from, taxonProp = 'vernacularName'}) =>
        new Promise(resolve => {
            this.taxonomyApi.taxonomyFindBySubject(
              Util.parseJSONPointer(formData, from),
              this.lang
            ).subscribe(taxon => {
              resolve(taxon[taxonProp]);
            })
      }),
      area: ({type, key = 'value', from, delimiter}) =>
        new Promise(resolve => {
          const areaValue = Util.parseJSONPointer(formData, from);
          this.areaService.getAreaType(this.lang, type).subscribe(areas => {
            const idToArea = areas.reduce((dict, area) => {
              dict[area.id] = area;
              return dict;
            }, {});
            if (areaValue instanceof Array) {
              resolve(areaValue.map(id => idToArea[id][key]).join(delimiter));
            } else {
              resolve(idToArea[areaValue][key]);
            }
          });
        })
    };
    const prepopulatedDocument = this.getPrepopulatedDocument(namedPlace).prepopulatedDocument;
    const fieldPointers = Object.keys(options);
    return new Promise(resolve => Promise.all(fieldPointers.map(fieldPointer => {
      let valueOrPromise = undefined;
      if (typeof options[fieldPointer] === 'string') {
        valueOrPromise = Util.parseJSONPointer(formData, options[fieldPointer]);
      } else {
        const {fn, ...params} = options[fieldPointer];
        valueOrPromise = fns[fn](params);
      }
      return valueOrPromise && valueOrPromise.then
        ? valueOrPromise
        : Promise.resolve(valueOrPromise);
    })).then(values => {
      values.forEach((value, i) => {
        Util.updateWithJSONPointer(prepopulatedDocument, fieldPointers[i], value);
      });
      return;
      resolve(namedPlace);
    }));
  }

  private localityToPrepopulatedDocument(data, formData) {
    if (!formData.locality && !formData.localityDescription) {
      return;
    }

    this.getPrepopulatedDocument(data);

    const populate = data.prepopulatedDocument;

    if (!populate.gatherings) {
      populate.gatherings = [{}];
    } else if (!populate.gatherings[0]) {
      populate.gatherings[0] = {};
    }

    if (formData.locality) {
      populate.gatherings[0].locality = formData.locality;
    }

  if (formData.localityDescription) {
    populate.gatherings[0].localityDescription = formData.localityDescription;
  }
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
}
