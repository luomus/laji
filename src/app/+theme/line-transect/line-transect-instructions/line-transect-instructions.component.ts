import { WINDOW } from '@ng-toolkit/universal';
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'laji-line-transect-instructions',
  templateUrl: './line-transect-instructions.component.html',
  styleUrls: ['./line-transect-instructions.component.css']
})
export class LineTransectInstructionsComponent implements OnInit {

  constructor(
    @Inject(WINDOW) private window: Window,
    public translate: TranslateService,
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

  toFragment(fragment) {
    if (isPlatformBrowser(this.platformID)) {
      window.location.hash = fragment;
    }
  }
}
