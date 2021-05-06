import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'laji-types',
  templateUrl: './types.component.html',
  styleUrls: ['./types.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TypesComponent {
  @Input() types: any;
  @Input() showFacts = false;
  @Input() title: string;
}
