import { Component, OnInit, Input, Output, ViewChild, TemplateRef, EventEmitter } from '@angular/core';
import { DatatableColumn } from '../../../../shared-modules/datatable/model/datatable-column';

@Component({
  selector: 'laji-wbc-route-table',
  templateUrl: './wbc-route-table.component.html',
  styleUrls: ['./wbc-route-table.component.css']
})
export class WbcRouteTableComponent implements OnInit {
  rows: any[];
  columns: DatatableColumn[] = [];

  @ViewChild('textOrTranslationKey') textOrTranslationKeyTpl: TemplateRef<any>;
  @ViewChild('numberOrDocumentIds') numberOrDocumentIdsTpl: TemplateRef<any>;

  @Output() onDocumentClick = new EventEmitter<string>();

  @Input() set data(data: any) {
    if (!data) {
      this.rows = undefined;
      this.columns = [];
      return;
    }
    this.rows = data.speciesStats.concat(data.otherStats);
    this.setColumns(data);
  }

  constructor() { }

  ngOnInit() { }

  setColumns(data) {
    this.columns = [{name: 'name', label: 'result.unit.taxonVerbatim', cellTemplate: this.textOrTranslationKeyTpl}];
    if (data.speciesStats.length > 0) {
      for (let i = data.oldestYear; i <= data.newestYear; i++) {
        this.columns.push({name: i + '', label: i + '/' + (i + 1), width: 85, cellTemplate: this.numberOrDocumentIdsTpl})
      }
    }
    this.columns.push({name: 'mean', label: 'wbc.stats.route.mean', width: 85});
    this.columns.push({name: 'median', label: 'wbc.stats.route.median', width: 85});
    this.columns.push({name: 'name', label: 'result.unit.taxonVerbatim', cellTemplate: this.textOrTranslationKeyTpl});
  }
}
