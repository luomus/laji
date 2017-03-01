import { Component, OnInit, Input, Output, ViewChild, EventEmitter, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LajiFormComponent } from '../../../../shared/form/laji-form.component';
import { FormService } from '../../../form/form.service';
import { UserService } from '../../../../shared/service/user.service';
import { NamedPlacesService } from '../../named-places.service';
import { NamedPlace } from '../../../../shared/model/NamedPlace';
import { WindowRef } from '../../../../shared/windows-ref';
import { ToastsService } from '../../../../shared/service/toasts.service';

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
  enablePrivate = true;

  private hasChanges = false;
  private public = false;

  @ViewChild(LajiFormComponent) lajiForm: LajiFormComponent;

  constructor(
    private formService: FormService,
    private  userService: UserService,
    private namedPlaceService: NamedPlacesService,
    private winRef: WindowRef,
    private translate: TranslateService,
    private toastsService: ToastsService
  ) { }

  onChange() {
    this.hasChanges = true;
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
        console.log(err);
        this.lajiForm.unBlock();
        this.saving = false;
        /*this.error = this.parseErrorMessage(err);
        this.status = 'error';
        setTimeout(() => {
          if (this.status === 'error') {
            this.status = '';
          }
        }, 5000);*/
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
    const formData = event.data.formData.namedPlace[0];
    const data: NamedPlace = {'name': '', 'geometry': ''};

    const keys = Object.keys(formData);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (formData[key] !== undefined && key !== 'geometryOnMap') {
        data[key] = formData[key];
      }
    }
    data['geometry'] = formData.geometryOnMap.geometries[0];
    data['public'] = this.public;

    return data;
  }
}
