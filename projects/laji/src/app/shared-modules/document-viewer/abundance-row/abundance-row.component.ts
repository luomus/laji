import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'laji-abundance-row',
  template: `
    <p>{{abundanceString}}<span class="abundance-unit">[{{abundanceUnit}}]</span></p>
  `,
  styleUrls: ['./abundance-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AbundanceRowComponent {
  @Input() abundanceString: string;
  @Input() abundanceUnit: string;
}
