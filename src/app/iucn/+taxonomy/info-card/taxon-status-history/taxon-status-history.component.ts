import { Component, Input, OnInit } from '@angular/core';
import { LatestRedListStatusFinland } from '../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-status-history',
  templateUrl: './taxon-status-history.component.html',
  styleUrls: ['./taxon-status-history.component.css']
})
export class TaxonStatusHistoryComponent implements OnInit {

  @Input()
  history: LatestRedListStatusFinland[] = [];

  constructor() { }

  ngOnInit() {
  }

}
