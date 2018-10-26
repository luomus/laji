import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
import { WINDOW } from '@ng-toolkit/universal';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'laji-wbc-instructions',
  templateUrl: './wbc-instructions.component.html',
  styleUrls: ['./wbc-instructions.component.css']
})
export class WbcInstructionsComponent implements OnInit {

  showMapInfo = false;

  constructor(
    @Inject(WINDOW) private window: Window,
    public translate: TranslateService,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformID: object
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformID)) {
      this.route.fragment.subscribe((frag) => {
        if (frag) {
          window.location.hash = frag;
        }
      });
    }
  }

  toFragment(fragment) {
    if (isPlatformBrowser(this.platformID)) {
      window.location.hash = fragment;
    }
  }

}
