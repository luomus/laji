import {
  Component, ChangeDetectionStrategy, ContentChildren, QueryList, TemplateRef, ContentChild, ChangeDetectorRef, Input
} from '@angular/core';
import { ComboCheckboxRowComponent } from './combo-checkbox-row.component';

@Component({
  selector: 'lu-combo-checkbox',
  templateUrl: './combo-checkbox.component.html',
  styleUrls: ['./combo-checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComboCheckboxComponent {
  @Input() title = 'combo-checkbox';

  rows: ComboCheckboxRowComponent[];
  @ContentChildren(ComboCheckboxRowComponent) set _rows(r: QueryList<ComboCheckboxRowComponent>) {
    // Atm this query is unused... TODO: count activated checkboxes and show in title
    this.rows = r.toArray();
  }

  constructor(private cdr: ChangeDetectorRef) {}

  open = false;

  toggleDropdown() {
    this.open = !this.open;
    console.log(this.open);
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }
}
