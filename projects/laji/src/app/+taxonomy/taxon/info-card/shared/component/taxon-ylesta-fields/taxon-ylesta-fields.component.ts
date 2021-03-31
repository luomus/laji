import { Component, Input } from '@angular/core';

@Component({
  selector: 'laji-taxon-ylesta-fields',
  templateUrl: './taxon-ylesta-fields.component.html',
  styleUrls: ['./taxon-ylesta-fields.component.scss']
})
export class TaxonYlestaFieldsComponent {

  @Input() info: any;

}
