import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Form } from '../../../shared/model/Form';

@Component({
  selector: 'laji-form-row',
  templateUrl: './form-row.component.html',
  styleUrls: ['./form-row.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormRowComponent implements OnInit {

  @Input() tmpDocuments: {[formId: string]: string} = {};
  @Input() hasAdminRight = false;
  @Input() form: Form.List;

  constructor() { }

  ngOnInit() {
  }

}
