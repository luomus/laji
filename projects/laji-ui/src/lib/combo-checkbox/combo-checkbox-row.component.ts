import { ChangeDetectionStrategy, Component, ElementRef, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'lu-combo-checkbox-row',
  template: '<lu-checkbox (checked)="onCheck($event)"><ng-content></ng-content></lu-checkbox>',
  styles: [`
:host {
  display: block;
}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComboCheckboxRowComponent {
  @Output() checked = new EventEmitter<boolean>();

  constructor(public element: ElementRef) {}

  onCheck(event) {
    this.checked.emit(event);
  }
}
