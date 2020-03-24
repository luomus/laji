import { Component, EventEmitter, HostListener, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
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
import merge from 'deepmerge';

@Component({
  selector: 'laji-np-edit-form',
  templateUrl: './np-edit-form.component.html',
  styleUrls: ['./np-edit-form.component.css']
})
export class NpEditFormComponent implements OnInit {
  @Input() placeForm: any;
  @Input() namedPlace: NamedPlace;
  @Input() namedPlaceOptions: any;
  @Output() editReady = new EventEmitter<{np?: NamedPlace, isEdit?: boolean}>();

  lang: string;
  saving = false;
  status = '';
  error = '';

  private hasChanges = false;
  private isPublic = false;

  @ViewChild(LajiFormComponent, { static: true }) lajiForm: LajiFormComponent;

  constructor(@Inject(WINDOW) private window: Window,
    private userService: UserService,
    private namedPlaceService: NamedPlacesService,
    private translate: TranslateService,
    private toastsService: ToastsService,
    private taxonomyApi: TaxonomyApi,
    private areaService: AreaService
  ) { }

  ngOnInit() {
    this.lang = this.translate.currentLang;
  }

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
    if (!event.data.formData) {
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
            this.editReady.emit({np: result, isEdit: !!this.namedPlace});
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
        if (!this.hasChanges || this.window.confirm(confirm)) {
          this.editReady.emit();
        }
      }
    );
  }

  private getNamedPlaceData(event) {
    const filteredKeys = ['geometry', 'locality', 'localityDescription', 'placeWrapper'];

    const formData = event.data.formData;
    const data: any = {};

    const keys = Object.keys(formData);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (formData[key] !== undefined && filteredKeys.indexOf(key) === -1) {
        data[key] = formData[key];
      }
    }

    data.geometry = formData.geometry;

    if (this.namedPlaceOptions && this.namedPlaceOptions.prepopulatedDocumentFields) {
      this.mergePrepopulatedDocument(data, formData);
    }

    return Promise.resolve(data);
  }

  private mergePrepopulatedDocument(namedPlace, formData) {
    namedPlace.prepopulatedDocument = this.namedPlace && this.namedPlace.prepopulatedDocument || {};
    if (formData.prepopulatedDocument) {
      namedPlace.prepopulatedDocument = merge(
        namedPlace.prepopulatedDocument,
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
}
