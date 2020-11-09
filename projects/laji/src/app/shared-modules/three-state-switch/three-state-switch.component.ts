import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'laji-three-state-switch',
  templateUrl: './three-state-switch.component.html',
  styleUrls: ['./three-state-switch.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThreeStateSwitchComponent {

  _switchState: 'true'|'false'|'undefined';

  @Input() offValue: any = false;
  @Input() offText = '';
  @Input() offColor = '';
  @Input() onValue: any = true;
  @Input() onText = '';
  @Input() showUndefined = false;
  @Input() undefinedValue: any = undefined;
  @Input() undefinedText = '';
  @Input() size = 'small';
  @Input() onColor = 'primary';
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<any>();
  @Output() change = new EventEmitter<any>();

  constructor(private cdr: ChangeDetectorRef) { }

  @Input()
  set value(value: any) {
    if (value === this.onValue) {
      this._switchState = 'true';
    } else if (value === this.offValue) {
      this._switchState = 'false';
    } else if (value === this.undefinedValue) {
      this._switchState = 'undefined';
    } else {
      this._switchState = undefined;
    }
  }

  switch(value) {
    if (this._switchState === value && !this.showUndefined) {
      this._switchState = undefined;
    } else {
      this._switchState = value;
    }
    this.cdr.detectChanges();
    this.valueChange.emit(
      this._switchState === 'true' ? this.onValue : (
        this._switchState === 'false' ? this.offValue : (
          this._switchState === 'undefined' ? this.undefinedValue : undefined
        )
      )
    );
    this.change.emit();
  }

}
