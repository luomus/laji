import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PlatformService } from '../../root/platform.service';
import { BaseDataService } from '../../graph-ql/service/base-data.service';

@Component({
    selector: 'laji-external-redirect',
    template: `<div></div>`,
    standalone: false
})
export class ExternalRedirectComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private platformService: PlatformService,
    private baseDataService: BaseDataService,
  ) {}

  ngOnInit(): void {
    if (!this.platformService.isBrowser) {
      return;
    }

    const linkKey = this.route.snapshot.data.linkKey;
    if (!linkKey) {
      throw new Error('Route data is missing the linkKey');
    }

    this.translateService.get(linkKey).subscribe(linkUrl => {
      if (!linkUrl) {
        throw new Error(`Link ${linkKey} is not found in the translations`);
      }

      this.baseDataService.ngOnDestroy(); // baseDataService can throw an error if the location is changed before it's destroyed
      this.platformService.window.location.href = linkUrl;
    });
  }

}
