import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ISelectFields } from '../select-fields/select-fields.component';

@Component({
  selector: 'laji-select-fields-modal-gear',
  templateUrl: './select-fields-modal-gear.component.html',
  styleUrls: ['./select-fields-modal-gear.component.scss']
})
export class SelectFieldsModalGearComponent implements OnInit {

  @Input() selectedFields: ISelectFields[] = [];
  @Input() allSelectableFields: ISelectFields[] = [];

  @Input() btnClass: string;
  @Input() modalTitle: string;
  @Input() selectedFieldsTitle: string;
  @Input() allSelectableFieldsTitle: string;

  @Output() selectedFieldsChange = new EventEmitter<ISelectFields[]>();
  selectedCache: ISelectFields[];

  constructor() { }

  ngOnInit() {
  }

}
