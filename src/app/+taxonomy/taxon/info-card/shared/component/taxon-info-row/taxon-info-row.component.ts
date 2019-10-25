import { Component, ContentChild, Input, OnInit, TemplateRef } from '@angular/core';

@Component({
  selector: 'laji-taxon-info-row',
  templateUrl: './taxon-info-row.component.html',
  styleUrls: ['./taxon-info-row.component.scss']
})
export class TaxonInfoRowComponent implements OnInit {
  @ContentChild('label', {static: true}) labelTpl: TemplateRef<any>;
  @Input() label: string;

  constructor() { }

  ngOnInit() {
  }

}
