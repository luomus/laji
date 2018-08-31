import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { DocumentObjectField } from './document-object-field';

@Component({
  selector: 'laji-document-object',
  templateUrl: './document-object.component.html',
  styleUrls: ['./document-object.component.css']
})
export class DocumentObjectComponent implements OnInit {
  @Input() object: any;
  @Input() fields: any;
  @Input() hideTooltips = false;

  _fields: DocumentObjectField[];

  @ViewChild('checkbox') checkboxTpl: TemplateRef<any>;
  @ViewChild('select') selectTpl: TemplateRef<any>;
  @ViewChild('taxonCensus') taxonCensusTpl: TemplateRef<any>;
  @ViewChild('fieldset') fieldsetTpl: TemplateRef<any>;
  @ViewChild('default') defaultTpl: TemplateRef<any>;

  constructor() { }

  ngOnInit() {
    this._fields = this.fields.reduce((res, field) => {
      res.push({
        name: field.name,
        label: field.label,
        type: field.type,
        enums: field.type === 'select' ? field.options.value_options : undefined,
        fields: field.fields,
        template: this[field.name + 'Tpl'] ? this[field.name + 'Tpl'] : (
          this[field.type + 'Tpl'] ? this[field.type + 'Tpl'] : this.defaultTpl
        )
      });
      return res;
    }, []);
  }
}
