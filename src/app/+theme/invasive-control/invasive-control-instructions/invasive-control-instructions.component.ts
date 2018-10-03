import { WINDOW } from '@ng-toolkit/universal';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { FormService } from '../../../shared/service/form.service';
import { FormPermissionService, Rights } from '../../../+haseka/form-permission/form-permission.service';
import { environment } from '../../../../environments/environment';
import { Observable, of as ObservableOf, Subscription } from 'rxjs';
import {UserService} from "../../../shared/service/user.service";

@Component({
  selector: 'laji-invasive-control-instructions',
  templateUrl: './invasive-control-instructions.component.html',
  styleUrls: ['./invasive-control-instructions.component.css']
})
export class InvasiveControlInstructionsComponent implements OnInit {

  rights: Observable<Rights>;
  form: any;

  constructor(
    @Inject(WINDOW) private window: Window,
    public translate: TranslateService,
    private route: ActivatedRoute,
    private formService: FormService,
    private formPermissionService: FormPermissionService,
    private translateService: TranslateService,
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformID: object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformID)) {
      this.route.fragment.subscribe((frag) => {
        if (frag) {
          window.location.hash = frag;
        }
      });
    }
    this.formService.getForm(environment.invasiveControlForm, this.translateService.currentLang).subscribe(form => {
      this.rights = this.formPermissionService.getRights(form);
      this.form = form;
    }, () => {
      this.rights = ObservableOf({edit: false, admin: false});
    })
  }
}
