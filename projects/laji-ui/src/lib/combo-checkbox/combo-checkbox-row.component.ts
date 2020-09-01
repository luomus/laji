import { ChangeDetectionStrategy, Component, ElementRef, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { CheckboxComponent } from '../checkbox/checkbox.component';

@Component({
  selector: 'lu-combo-checkbox-row',
  template: '<lu-checkbox [disabled]="disabled" (checked)="onCheck($event)"><ng-content></ng-content></lu-checkbox>',
  styles: [`
:host {
  display: block;
}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComboCheckboxRowComponent {
  @ViewChild(CheckboxComponent, { static: true }) cb: CheckboxComponent;

  @Input('checked') set checkedInput(checked: boolean) {
    this.cb.checkedInput = checked;
  }
  @Input() disabled = false;
  @Output() checked = new EventEmitter<boolean>();

  constructor(public element: ElementRef) {}

  onCheck(event) {
    this.checked.emit(event);
  }
}
