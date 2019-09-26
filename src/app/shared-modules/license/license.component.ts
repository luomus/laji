import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IdService } from '../../shared/service/id.service';
import { Logger } from '../../shared/logger/logger.service';

interface ILicense {
  link?: string;
  img?: string;
}

const LICENSES: {[type: string]: ILicense} = {
  'MZ.intellectualRightsODBL-1.0': {
    link: 'https://opendatacommons.org/licenses/odbl/summary/index.html'
  },
  'MZ.intellectualRightsCC0': {
    link: 'https://creativecommons.org/publicdomain/zero/1.0/',
    img: 'cc-zero.png'
  },
  'MZ.intellectualRightsCC0-4.0': {
    link: 'https://creativecommons.org/publicdomain/zero/1.0/',
    img: 'cc-zero.png'
  },
  'MZ.intellectualRightsPD': {},
  'MZ.intellectualRightsARR': {},
  'MZ.intellectualRightsCC-BY': {
    link: 'https://creativecommons.org/licenses/by/4.0/',
    img: 'by.png'
  },
  'MZ.intellectualRightsCC-BY-2.0': {
    link: 'https://creativecommons.org/licenses/by/2.0/',
    img: 'by.png'
  },
  'MZ.intellectualRightsCC-BY-3.0': {
    link: 'https://creativecommons.org/licenses/by/3.0/',
    img: 'by.png'
  },
  'MZ.intellectualRightsCC-BY-4.0': {
    link: 'https://creativecommons.org/licenses/by/4.0/',
    img: 'by.png'
  },
  'MZ.intellectualRightsCC-BY-NC-4.0': {
    link: 'https://creativecommons.org/licenses/by-nc/4.0/',
    img: 'by-nc.png'
  },
  'MZ.intellectualRightsCC-BY-ND-4.0': {
    link: 'https://creativecommons.org/licenses/by-nd/4.0/',
    img: 'by-nd.png'
  },
  'MZ.intellectualRightsCC-BY-NC-ND-4.0': {
    link: 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
    img: 'by-nc-nd.png'
  },
  'MZ.intellectualRightsCC-BY-NC-2.0': {
    link: 'https://creativecommons.org/licenses/by-nc/2.0/',
    img: 'by-nc.png'
  },
  'MZ.intellectualRightsCC-BY-SA-4.0': {
    link: 'https://creativecommons.org/licenses/by-sa/4.0/',
    img: 'by-sa.png'
  },
  'MZ.intellectualRightsCC-BY-SA-3.0': {
    link: 'https://creativecommons.org/licenses/by-sa/3.0/',
    img: 'by-sa.png'
  },
  'MZ.intellectualRightsCC-BY-SA-2.5': {
    link: 'https://creativecommons.org/licenses/by-sa/2.5/',
    img: 'by.png'
  },
  'MZ.intellectualRightsCC-BY-SA-2.0': {
    link: 'https://creativecommons.org/licenses/by-sa/2.0/',
    img: 'by-sa.png'
  },
  'MZ.intellectualRightsCC-BY-SA-2.5-SE': {
    link: 'https://creativecommons.org/licenses/by-sa/2.5/se/deed.en',
    img: 'by-sa.png'
  },
  'MZ.intellectualRightsCC-BY-SA-2.0-DE': {
    link: 'https://creativecommons.org/licenses/by-sa/2.0/de/deed.en',
    img: 'by-sa.png'
  },
  'MZ.intellectualRightsCC-BY-NC-SA-4.0': {
    link: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    img: 'by.png'
  },
  'MZ.intellectualRightsCC-BY-NC-SA-2.0': {
    link: 'https://creativecommons.org/licenses/by-nc-sa/2.0/',
    img: 'by-nc-sa.png'
  },
  'MZ.intellectualRightsCC-BY-NC-SA-3.0': {
    link: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    img: 'by-nc-sa.png'
  },
  'MZ.intellectualRightsCC-BY-NC-ND-2.0': {
    link: 'https://creativecommons.org/licenses/by-nc-nd/2.0/',
    img: 'by-nc-nd.png'
  },
};

@Component({
  selector: 'laji-license',
  template: `
    <ng-container [ngSwitch]="_type">
        <ng-container *ngSwitchCase="'MZ.intellectualRightsARR'">
            © {{ _type | label }}
        </ng-container>
        <ng-container *ngSwitchCase="'MZ.intellectualRightsPD'">
            {{ _type | label }}
        </ng-container>
        <a *ngSwitchDefault [href]="_license.link" target="_blank" rel="noopener nofollow">
            <img *ngIf="_license.img; else noImg" [src]="'static/images/license-icons/' + _license.img"
                 [alt]="_sort"
                 style="height: 18px">
            <ng-template #noImg>{{ _type | label }}</ng-template>
        </a>
    </ng-container>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LicenseComponent {

  private _type: string;
  private _sort: string;
  private _license: ILicense;

  constructor(
    private logger: Logger
  ) { }

  @Input()
  set type(type: string) {
    if (!type) {
      return;
    }
    type = IdService.getId(type).replace(/^MY\./, 'MZ.');
    if (!LICENSES[type]) {
      this.logger.error('Unknown license!', type);
      type = 'MZ.intellectualRightsARR';
    }
    this._type = type;
    this._license = LICENSES[this._type];
    this._sort = type.replace('MZ.intellectualRights', '').replace('CC-', 'CC ').replace(/-([0-9]+)/, ' $1');
  }
}
