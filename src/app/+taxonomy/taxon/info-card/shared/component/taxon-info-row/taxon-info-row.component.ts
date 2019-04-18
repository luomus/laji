import {Component, OnInit, Input, ContentChild, TemplateRef} from '@angular/core';

@Component({
  selector: 'laji-taxon-info-row',
  templateUrl: './taxon-info-row.component.html',
  styleUrls: ['./taxon-info-row.component.scss']
})
export class TaxonInfoRowComponent implements OnInit {
  @ContentChild('label') labelTpl: TemplateRef<any>;
  @Input() label: string;

  constructor() { }

  ngOnInit() {
  }

}
