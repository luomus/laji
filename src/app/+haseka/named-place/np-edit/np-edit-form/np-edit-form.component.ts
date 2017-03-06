import { Component, OnInit, Input, Output, ViewChild, EventEmitter, ContentChildren, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LajiFormComponent } from '../../../../shared/form/laji-form.component';
import { FormService } from '../../../form/form.service';
import { UserService } from '../../../../shared/service/user.service';
import { NamedPlacesService } from '../../named-places.service';
import { NamedPlace } from '../../../../shared/model/NamedPlace';
import { WindowRef } from '../../../../shared/windows-ref';
import { ToastsService } from '../../../../shared/service/toasts.service';
import { Form } from '../../../../shared/model/FormListInterface';

@Component({
  selector: 'laji-np-edit-form',
  templateUrl: './np-edit-form.component.html',
  styleUrls: ['./np-edit-form.component.css']
})
export class NpEditFormComponent implements OnInit {
  @Input() lang: string;
  @Input() formData: any;
  @Input() namedPlace: NamedPlace;
  @Input() collectionId: string;
  @Output() onEditReady = new EventEmitter<NamedPlace>();

  tick = 0;
  saving = false;
  enablePrivate = false;
  status = '';
  error = '';

  private hasChanges = false;
  private public = false;

  @ViewChild(LajiFormComponent) lajiForm: LajiFormComponent;
  @ContentChildren(LajiFormComponent) lajiFormChildren;

  constructor(
    private formService: FormService,
    private  userService: UserService,
    private namedPlaceService: NamedPlacesService,
    private winRef: WindowRef,
    private translate: TranslateService,
    private toastsService: ToastsService
  ) { }

  ngOnInit() {
    this.enablePrivate = !this.formData.features || this.formData.features.indexOf(Form.Feature.NoPrivate) === -1;
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
    if (!('namedPlace' in event.data.formData)) {
      this.lajiForm.unBlock();
      return;
    }
    this.saving = true;
    this.lajiForm.block();
    const data = this.getNamedPlaceData(event);

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
        this.onEditReady.emit();
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
  }

  submitPublic() {
    this.public = true;
    this.lajiForm.submit();
  }

  submitPrivate() {
    this.public = false;
    this.lajiForm.submit();
  }

  discard() {
    this.translate.get('haseka.form.discardConfirm').subscribe(
      (confirm) => {
        if (!this.hasChanges) {
          this.onEditReady.emit();
        } else if (this.winRef.nativeWindow.confirm(confirm)) {
          this.formService.discard();
          this.onEditReady.emit();
        }
      }
    );
  }

  private getNamedPlaceData(event) {
    const filteredKeys = ['geometryOnMap', 'locality', 'localityDescription'];

    const formData = event.data.formData.namedPlace[0];
    const data: NamedPlace = {'name': '', 'geometry': ''};

    const keys = Object.keys(formData);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (formData[key] !== undefined && filteredKeys.indexOf(key) === -1) {
        data[key] = formData[key];
      }
    }
    data['geometry'] = formData.geometryOnMap.geometries[0];
    data['public'] = this.public;
    data['collectionID'] = this.collectionId;

    this.localityToPrepopulatedDocument(data, formData);
    return data;
  }

  private localityToPrepopulatedDocument(data, formData) {
    if (formData.locality || formData.localityDescription) {
      data['prepopulatedDocument'] = this.namedPlace.prepopulatedDocument ? this.namedPlace.prepopulatedDocument : {};

      if (!data.prepopulatedDocument.gatherings || data.prepopulatedDocument.gatherings.length <= 0) {
        data.prepopulatedDocument['gatherings'] = [{}];
      }

      if (formData.locality) {
        data.prepopulatedDocument.gatherings[0]['locality'] = formData.locality;
      }

      if (formData.localityDescription) {
        data.prepopulatedDocument.gatherings[0]['localityDescription'] = formData.localityDescription;
      }
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
