import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'laji-taxon-status-history',
  templateUrl: './taxon-status-history.component.html',
  styleUrls: ['./taxon-status-history.component.css']
})
export class TaxonStatusHistoryComponent implements OnInit {

  @Input()
  history: {status: string, year: number, criteria: string, reasons: string, threats: string}[] = [];

  constructor() { }

  ngOnInit() {
  }

}
