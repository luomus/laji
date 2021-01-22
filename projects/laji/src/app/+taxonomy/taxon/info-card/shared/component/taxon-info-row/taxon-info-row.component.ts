import { Component, ContentChild, Input, TemplateRef } from '@angular/core';

@Component({
  selector: 'laji-taxon-info-row',
  templateUrl: './taxon-info-row.component.html',
  styleUrls: ['./taxon-info-row.component.scss']
})
export class TaxonInfoRowComponent {
  @ContentChild('label', {static: true}) labelTpl: TemplateRef<any>;
  @Input() label: string;
  @Input() keyTextContentGhost = true;
  @Input() valueTextContentGhost = true;
  @Input() hasOtherItemBefore = false;

}
