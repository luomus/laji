import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface SelectOption {
  label: string,
  value: string
}

@Component({
  selector: 'laji-select2',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent {

  @Input() value: string;
  @Input() placeholder: string;
  @Input() options: SelectOption[];

  @Output() valueChange = new EventEmitter();

  onChange(event) {
    event.stopPropagation();
    this.valueChange.emit(event.target.value);
  }

}
