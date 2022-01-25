/* tslint:disable:component-selector */
import { Component, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';

export interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'select[laji-dropdown]',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent {

  @Input() value: string;
  @Input() placeholder: string;
  @Input() options: SelectOption[];

  @Output() valueChange = new EventEmitter();
  @HostBinding('class') @Input() class = 'form-control';

  @HostListener('change', ['$event'])
  onChange(event) {
    event.stopPropagation();
    this.valueChange.emit(event.target.value);
  }

}
