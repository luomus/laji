import {
  Component, ChangeDetectionStrategy, ContentChildren, QueryList, ChangeDetectorRef, Input, AfterViewInit, Renderer2, ElementRef
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
