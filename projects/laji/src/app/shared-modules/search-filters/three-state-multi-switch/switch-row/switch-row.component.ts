import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

export enum CheckboxType {
  basic = 'basic',
  excluded = 'excluded',
  partial = 'partial'
}

@Component({
  selector: 'laji-switch-row',
  templateUrl: './switch-row.component.html',
  styleUrls: ['./switch-row.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwitchRowComponent implements OnChanges {

  value = false;

  @Input() option: {id: string, value: string};
  @Input() trueValue: string[];
  @Input() falseValue: string[];

  @Output() update = new EventEmitter<{id: string, value: any}>();

  state;
  typeCheckbox: CheckboxType;

  constructor() { }

  ngOnChanges() {
    if (!this.option) {
      return;
    }
    if (Array.isArray(this.trueValue) && this.trueValue.indexOf(this.option.id) > -1) {
      this.state = true;
    } else if (Array.isArray(this.falseValue) && this.falseValue.indexOf(this.option.id) > -1) {
      this.state = false;
    } else {
      this.state = undefined;
    }
    this.typeCheckbox = CheckboxType.excluded;
  }

  updateValue() {
    this.update.emit({id: this.option.id, value: this.state});
  }

}
