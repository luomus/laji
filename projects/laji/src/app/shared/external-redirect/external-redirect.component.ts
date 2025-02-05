import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PlatformService } from '../../root/platform.service';
import { BaseDataService } from '../../graph-ql/service/base-data.service';

@Component({
  selector: 'laji-external-redirect',
  template: `<div></div>`
})
export class ExternalRedirectComponent {
  constructor(
    route: ActivatedRoute,
    translateService: TranslateService,
    platformService: PlatformService,
    baseDataService: BaseDataService
  ) {
    const linkKey = route.snapshot.data.linkKey;
    if (!linkKey) {
      throw new Error('Route data is missing the linkKey');
    }

    translateService.get(linkKey).subscribe(linkUrl => {
      if (!linkUrl) {
        throw new Error(`Link ${linkKey} is not found in the translations`);
      }

      baseDataService.ngOnDestroy(); // baseDataService can throw an error if the location is changed before it's destroyed
      platformService.window.location.href = linkUrl;
    });
  }

}
