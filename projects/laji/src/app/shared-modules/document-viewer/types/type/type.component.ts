import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'laji-type',
  templateUrl: './type.component.html',
  styleUrls: ['./type.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TypeComponent {
  @Input() type: any;
  @Input() showFacts = false;

  onTaxonLinkClick(event: MouseEvent) {
    event.stopPropagation();
  }
}
