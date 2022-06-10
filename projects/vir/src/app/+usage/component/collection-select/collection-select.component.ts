import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'vir-collection-select',
  templateUrl: './collection-select.component.html',
  styleUrls: ['./collection-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionSelectComponent {

  readonly collections = environment.rootCollections;

  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() select = new EventEmitter<string>();

  constructor() {}
}
