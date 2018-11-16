import { WINDOW } from '@ng-toolkit/universal';
import { Component, Inject, OnInit, PLATFORM_ID, ChangeDetectorRef, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { UserService } from '../../../shared/service/user.service';
import { Rights } from './invasive-control-instructions.container';

@Component({
  selector: 'laji-invasive-control-instructions',
  templateUrl: './invasive-control-instructions.component.html',
  styleUrls: ['./invasive-control-instructions.component.css']
})
export class InvasiveControlInstructionsComponent implements OnInit {
  Rights = Rights;

  @Input() rights: Rights = Rights.NotDefined;
  @Input() loggedIn: boolean;

  constructor(
    @Inject(WINDOW) private window: Window,
    public translate: TranslateService,
    public userService: UserService,
    private route: ActivatedRoute,
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
  }
}
