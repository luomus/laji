import { Component, Input, OnChanges, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';

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
  @Input() showUnitId = false;
  @Input() showLinks = true;

  templates: Record<string, any> = {};
  hasFacts = false;

  @ViewChild('checkbox', { static: true }) checkboxTpl!: TemplateRef<any>;
  @ViewChild('select', { static: true }) selectTpl!: TemplateRef<any>;
  @ViewChild('taxonCensus', { static: true }) taxonCensusTpl!: TemplateRef<any>;
  @ViewChild('fieldset', { static: true }) fieldsetTpl!: TemplateRef<any>;
  @ViewChild('facts', { static: true }) factsTpl!: TemplateRef<any>;
  @ViewChild('default', { static: true }) defaultTpl!: TemplateRef<any>;
  @ViewChild('taxonID', { static: true }) taxonIDTpl!: TemplateRef<any>;

  ngOnChanges(changes: SimpleChanges) {
    if (changes.fields || changes.object) {
      this.fields.map((field: any) => {
        this.templates[field.name] = (this as any)[field.name + 'Tpl'] ? (this as any)[field.name + 'Tpl'] : (
          field.type === 'fieldset' && field.name.slice(-4) === 'Fact' ? this.factsTpl : (
            (this as any)[field.type + 'Tpl'] ? (this as any)[field.type + 'Tpl'] : this.defaultTpl));

        if (this.templates[field.name] === this.factsTpl) {
          this.updateHasFacts(this.object[field.name], field.fields);
        }
      });
    }
  }

  private updateHasFacts(facts: any, fields: any[]) {
    if (!facts || !fields) {
      this.hasFacts = false;
      return;
    }

    for (const field of fields) {
      if (facts[field.name] && (field.type !== 'collection' || facts[field.name].length > 0)) {
        this.hasFacts = true;
        return;
      }
    }

    this.hasFacts = false;
  }
}
