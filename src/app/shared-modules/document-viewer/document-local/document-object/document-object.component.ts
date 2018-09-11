import { Component, Input, ViewChild, TemplateRef, SimpleChanges, OnChanges } from '@angular/core';

@Component({
  selector: 'laji-document-object',
  templateUrl: './document-object.component.html',
  styleUrls: ['./document-object.component.css']
})
export class DocumentObjectComponent implements OnChanges {
  @Input() object: any;
  @Input() hideTooltips = false;
  @Input() showFacts = false;
  @Input() fields: any;

  templates = {};
  hasFacts = false;

  @ViewChild('checkbox') checkboxTpl: TemplateRef<any>;
  @ViewChild('select') selectTpl: TemplateRef<any>;
  @ViewChild('taxonCensus') taxonCensusTpl: TemplateRef<any>;
  @ViewChild('fieldset') fieldsetTpl: TemplateRef<any>;
  @ViewChild('facts') factsTpl: TemplateRef<any>;
  @ViewChild('default') defaultTpl: TemplateRef<any>;

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.fields || changes.object) {
      this.fields.map(field => {
        this.templates[field.name] = this[field.name + 'Tpl'] ? this[field.name + 'Tpl'] : (
          field.type === 'fieldset' && field.name.slice(-4) === 'Fact' ? this.factsTpl : (
          this[field.type + 'Tpl'] ? this[field.type + 'Tpl'] : this.defaultTpl))

        if (this.templates[field.name] === this.factsTpl) {
          this.updateHasFacts(this.object[field.name], field.fields);
        }
      });
    }
  }

  private updateHasFacts(facts: any, fields: any[]) {
    if (!facts || !fields) {
      this.hasFacts = false;
    }

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      if (facts[field.name] && (field.type !== 'collection' || facts[field.name].length > 0)) {
        this.hasFacts = true;
        return;
      }
    }

    this.hasFacts = false;
  }
}
