import { Component, Output, Input, EventEmitter, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'lu-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxComponent {
  @ViewChild('checkbox', {static: true}) checkbox!: ElementRef;
  isChecked = false;

  /**
   * Set initial state of checkbox
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('checked') set checkedInput(checked: boolean) {
    this.isChecked = checked;
    this.checkbox.nativeElement.checked = checked;
  }

  @Input() disabled = false;

  /**
   * Changes to state of checkbox that were triggered by user
   */
  @Output() checked = new EventEmitter<boolean>();

  onInput(event: Event) {
    this.isChecked = (event.target as any)['checked'];
    this.checked.emit((event.target as any)['checked']);
  }
}
