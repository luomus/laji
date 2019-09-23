import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MappingService } from '../../service/mapping.service';

@Component({
  selector: 'laji-user-mapping-button',
  templateUrl: './user-mapping-button.component.html',
  styleUrls: ['./user-mapping-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserMappingButtonComponent {

  @Input() hasUserMapping = false;
  @Input() showSave = false;

  @Output() userMapping = new EventEmitter();
  @Output() clearUserMapping = new EventEmitter();

  constructor(private mappingService: MappingService) {}

  loadFile() {

  }
}
