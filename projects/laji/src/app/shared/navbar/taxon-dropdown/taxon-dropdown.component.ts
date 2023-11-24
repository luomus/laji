import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'laji-taxon-dropdown',
  templateUrl: './taxon-dropdown.component.html',
  styleUrls: [
    './taxon-dropdown.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonDropdownComponent {
  @Input() omniSearchVisible = true;
}
