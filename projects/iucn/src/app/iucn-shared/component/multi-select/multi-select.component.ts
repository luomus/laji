import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { SelectOption } from '../select/select.component';

@Component({
  selector: 'laji-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiSelectComponent implements OnInit {

  @Input() value: string[] = [];
  @Input() placeholder: string;
  @Input() options: SelectOption[];

  @Output() valueChange = new EventEmitter();

  selected = '';

  constructor(
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
  }

  onSelect(value: string) {
    const values = (this.value || []);
    if (!values.includes(value)) {
      this.value = [...values, value];
      this.valueChange.emit(this.value);
    }

    this.selected = value;
    setTimeout(() => {
      this.selected = '';
      this.cd.markForCheck();
    }, 0);
  }

  onListUpdate(value: string[]) {
    this.value = value;
    this.valueChange.emit(this.value);
  }
}
