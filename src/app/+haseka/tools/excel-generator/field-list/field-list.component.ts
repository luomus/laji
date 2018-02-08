import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormField } from '../../model/form-field';

@Component({
  selector: 'laji-field-list',
  templateUrl: './field-list.component.html',
  styleUrls: ['./field-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldListComponent implements OnInit {

  @Input() selected: string[] = [];
  @Input() fields: FormField[];
  @Input() parent = 'document';
  @Input() title = '';
  @Input() showTitle = true;
  @Output() toggle = new EventEmitter<FormField>();

  constructor() { }

  ngOnInit() {
  }

  onClick(field: FormField) {
    if (!field.required) {
      this.toggle.emit(field);
    }
  }

}
