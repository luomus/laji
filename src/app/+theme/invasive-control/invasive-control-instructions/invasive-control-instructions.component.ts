import { WINDOW } from '@ng-toolkit/universal';
import { Component, Inject, OnInit, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { FormService } from '../../../shared/service/form.service';
import { FormPermissionService } from '../../../+haseka/form-permission/form-permission.service';
import { environment } from '../../../../environments/environment';
import { UserService } from '../../../shared/service/user.service';

enum Rights {
  Allowed,
  NotAllowed,
  NotDefined
}

@Component({
  selector: 'laji-invasive-control-instructions',
  templateUrl: './invasive-control-instructions.component.html',
  styleUrls: ['./invasive-control-instructions.component.css']
})
export class InvasiveControlInstructionsComponent implements OnInit {
  Rights = Rights;

  rights: Rights = Rights.NotDefined;
  form: any;

  constructor(
    @Inject(WINDOW) private window: Window,
    public translate: TranslateService,
    public userService: UserService,
    private route: ActivatedRoute,
    private formService: FormService,
    private formPermissionService: FormPermissionService,
    private translateService: TranslateService,
    @Inject(PLATFORM_ID) private platformID: object,
    private cd: ChangeDetectorRef
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
      this.formPermissionService.getRights(form).subscribe((rights) => {
        if (rights.admin === true || rights.edit === true) {
          this.rights = Rights.Allowed;
        } else {
          this.rights = Rights.NotAllowed;
        }
        this.cd.markForCheck();
      }, () => {
        this.rights = Rights.NotDefined;
      })
      this.form = form;
    }, () => {
      this.rights = Rights.NotDefined;
    })
  }
}
