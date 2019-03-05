/* tslint:disable:component-selector */
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Rights } from '../../+haseka/form-permission/form-permission.service';

@Component({
  selector: 'laji-invasive-control',
  templateUrl: './invasive-control.component.html',
  styleUrls: ['./invasive-control.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvasiveControlComponent {
  @Input() rights: Rights;
}
