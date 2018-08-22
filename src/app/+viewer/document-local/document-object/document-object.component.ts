import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { DocumentObjectField } from './document-object-field';

@Component({
  selector: 'laji-document-object',
  templateUrl: './document-object.component.html',
  styleUrls: ['./document-object.component.css']
})
export class DocumentObjectComponent implements OnInit {
  @Input() object: any;

  _fields: DocumentObjectField[];
  ignoredFields = ['gatherings', 'units', 'identifications', 'geometry', 'images'];

  @ViewChild('checkbox') checkbox: TemplateRef<any>;
  @ViewChild('select') select: TemplateRef<any>;
  @ViewChild('fieldset') fieldset: TemplateRef<any>;
  @ViewChild('default') defaultTemplate: TemplateRef<any>;

  constructor() { }

  @Input() set fields(fields: any) {
    this._fields = fields.reduce((res, field) => {
      if (this.ignoredFields.indexOf(field.name) === -1) {
        res.push({
          name: field.name,
          label: field.label,
          type: field.type,
          enums: field.type === 'select' ? field.options.value_options : undefined,
          fields: field.fields,
          template: this[field.type] ? this[field.type] : this.defaultTemplate
        });
      }
      return res;
    }, []);
  }

  ngOnInit() {

  }
}
