import { Component, Inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { PlatformService } from '../../../shared/service/platform.service';

@Component({
  selector: 'laji-line-transect-instructions',
  templateUrl: './line-transect-instructions.component.html',
  styleUrls: ['./line-transect-instructions.component.css']
})
export class LineTransectInstructionsComponent implements OnInit {

  constructor(
    public translate: TranslateService,
    private route: ActivatedRoute,
    private platformService: PlatformService
  ) {}

  ngOnInit() {
    if (this.platformService.isBrowser) {
      this.route.fragment.subscribe((frag) => {
        if (frag) {
          window.location.hash = frag;
        }
      });
    }
  }

  toFragment(fragment) {
    if (this.platformService.isBrowser) {
      window.location.hash = fragment;
    }
  }
}
