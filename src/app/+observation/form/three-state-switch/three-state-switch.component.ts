import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'laji-three-state-switch',
  templateUrl: './three-state-switch.component.html',
  styleUrls: ['./three-state-switch.component.css']
})
export class ThreeStateSwitchComponent {

  _switchState;

  @Input() offValue = false;
  @Input() offText = '';
  @Input() offColor = '';
  @Input() onValue = true;
  @Input() onText = '';
  @Input() size = 'small';
  @Input() onColor = 'primary';

  @Output() valueChange = new EventEmitter<any>();
  @Output() change = new EventEmitter<any>();

  constructor(private cdr: ChangeDetectorRef) { }

  @Input()
  set value(value: any) {
    if (value === this.onValue) {
      this._switchState = true;
    } else if (value === this.offValue) {
      this._switchState = false;
    } else {
      this._switchState = undefined;
    }
  }

  switch(event) {
    if (event.previousValue === false && event.currentValue === true) {
      this._switchState = undefined;
    }
    this.cdr.detectChanges();
    this.valueChange.emit(this._switchState === true ? this.onValue : (this._switchState === false ? this.offValue : undefined));
    this.change.emit();
  }

}
