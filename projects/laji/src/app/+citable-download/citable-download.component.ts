import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  template: `
    <p>Citable download component</p>
  `,
  selector: 'laji-citable-download',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CitableDownloadComponent {

}
