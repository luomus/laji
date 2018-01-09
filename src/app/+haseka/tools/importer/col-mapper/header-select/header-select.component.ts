import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FieldMap, FormField } from '../../../model/form-field';

@Component({
  selector: 'laji-header-select',
  templateUrl: './header-select.component.html',
  styleUrls: ['./header-select.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderSelectComponent implements OnInit {

  @Input() options: string[] = [];
  @Input() fields: {[key: string]: FormField};
  @Output() selected = new EventEmitter<string>();

  fieldMap = FieldMap;

  @Input() value: string;

  constructor() {}

  ngOnInit() {
  }
}
