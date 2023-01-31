import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

interface ILicense {
  link: string;
  img: string;
}

@Component({
  selector: 'bsg-license',
  template: `
    <a *ngIf="license" [href]="license.link" target="_blank" rel="noopener nofollow">
      <img [src]="'static/images/license-icons/' + license.img" style="height: 18px">
    </a>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LicenseComponent {
  license?: ILicense;

  constructor() { }

  @Input()
  set licenseUrl(licenseUrl: string) {
    if (!licenseUrl) {
      this.license = undefined;
      return;
    }
    let licenseType = licenseUrl.split('/')[4];
    if (licenseType === 'zero') {
      licenseType = 'cc-' + licenseType;
    }
    this.license = {
      link: licenseUrl,
      img: licenseType + '.png'
    };
  }
}
