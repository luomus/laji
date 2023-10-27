import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'lu-progressbar',
  template: `
    <div class="lu-progressbar-fill" [style.width]="Math.floor(value / max * 100) + '%'" role="progressbar">
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./progressbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressbarComponent {

  @Input() max: number;
  @Input() value: number;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  Math = Math;
}
