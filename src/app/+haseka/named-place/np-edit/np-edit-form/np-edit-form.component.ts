import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { FooterService } from '../../../../shared/service/footer.service';
import { LajiFormComponent } from '../../../../shared/form/laji-form.component';
import { FormService } from '../../../form/form.service';
import { UserService } from '../../../../shared/service/user.service';
import { NamedPlacesService } from '../../named-places.service';

@Component({
  selector: 'laji-np-edit-form',
  templateUrl: './np-edit-form.component.html',
  styleUrls: ['./np-edit-form.component.css']
})
export class NpEditFormComponent implements OnInit {
  @Input() lang: string;
  @Input() formData: any;
  tick = 0;
  saving = false;
  enablePrivate = false;

  @ViewChild(LajiFormComponent) lajiForm: LajiFormComponent;

  constructor(
    private footerService: FooterService,
    private formService: FormService,
    private  userService: UserService,
    private namedPlaceService: NamedPlacesService
  ) { }

  ngOnInit() {
    this.footerService.footerVisible = false;
  }

  ngOnDestroy() {
    this.footerService.footerVisible = true;
  }

  onChange() {

  }

  onSubmit(event) {
    this.saving = true;
    this.lajiForm.block();
    let data = event.data.formData.namedPlace[0];
    const keys = Object.keys(data);

    for (let i in keys) {
      let key = keys[i];
      if (data[key] === undefined) {
        delete data[key];
      }
    }

    let create$ = this.namedPlaceService.createNamedPlace(data, this.userService.getToken());

    create$.subscribe(
      (result) => {
        this.lajiForm.unBlock();
        console.log(result);
      },
      (err) => {
        this.lajiForm.unBlock();
        console.log(err);
      });
  }

  submitPublic() {
    this.lajiForm.submit();
  }

  submitPrivate() {

  }

  discard() {

  }
}
