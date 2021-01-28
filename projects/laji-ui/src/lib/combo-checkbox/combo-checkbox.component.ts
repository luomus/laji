import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';

@Component({
  selector: 'lu-combo-checkbox',
  templateUrl: './combo-checkbox.component.html',
  styleUrls: ['./combo-checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComboCheckboxComponent {
  @Input() title = 'combo-checkbox';
  @Input() small = false;

  open = false;

  constructor(private cdr: ChangeDetectorRef) {}

  toggleDropdown() {
    this.open = !this.open;
    this.cdr.markForCheck();
  }

  onClickOutside() {
    this.open = false;
    this.cdr.markForCheck();
  }
}
