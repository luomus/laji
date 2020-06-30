import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { PlatformService } from '../../../shared/service/platform.service';

@Component({
  selector: 'laji-wbc-instructions',
  templateUrl: './wbc-instructions.component.html',
  styleUrls: ['./wbc-instructions.component.css']
})
export class WbcInstructionsComponent implements OnInit {

  constructor(
    public translate: TranslateService,
    private route: ActivatedRoute,
    private platformService: PlatformService
  ) { }

  ngOnInit() {
    if (this.platformService.isBrowser) {
      this.route.fragment.subscribe((frag) => {
        if (frag) {
          window.location.hash = frag;
        }
      });
    }
  }

}
