import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'laji-taxon-ylesta-fields',
  templateUrl: './taxon-ylesta-fields.component.html',
  styleUrls: ['./taxon-ylesta-fields.component.scss']
})
export class TaxonYlestaFieldsComponent implements OnInit {

  @Input() info: any;

  constructor() { }

  ngOnInit() {
  }

}
