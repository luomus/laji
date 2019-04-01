/* tslint:disable:component-selector */
import { ChangeDetectionStrategy, Component, OnInit, Input } from '@angular/core';
import { Rights } from '../../+haseka/form-permission/form-permission.service';

@Component({
  selector: 'laji-lolife',
  templateUrl: './lolife.component.html',
  styleUrls: ['./lolife.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LolifeComponent {
  @Input() rights: Rights;
}
