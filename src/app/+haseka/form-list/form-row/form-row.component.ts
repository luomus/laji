import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormListInterface } from '../../../shared/model/FormListInterface';

@Component({
  selector: 'laji-form-row',
  templateUrl: './form-row.component.html',
  styleUrls: ['./form-row.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormRowComponent implements OnInit {

  @Input() tmpDocuments: {[formId: string]: string} = {};
  @Input() hasAdminRight = false;
  @Input() form: FormListInterface;
  @Output() openForm = new EventEmitter<FormListInterface>();

  constructor() { }

  ngOnInit() {
  }

}
