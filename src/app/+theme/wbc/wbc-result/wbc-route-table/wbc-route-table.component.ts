import { Component, OnInit, Input, Output, ViewChild, TemplateRef, EventEmitter } from '@angular/core';
import { DatatableColumn } from '../../../../shared-modules/datatable/model/datatable-column';
import { LocalStorage } from 'ngx-webstorage';

@Component({
  selector: 'laji-wbc-route-table',
  templateUrl: './wbc-route-table.component.html',
  styleUrls: ['./wbc-route-table.component.css']
})
export class WbcRouteTableComponent implements OnInit {
  rows: any[];
  columns: DatatableColumn[] = [];

  _getRowClass: (data: any) => string = this.getRowClass.bind(this);
  _getCellClass: (data: any) => string = this.getCellClass.bind(this);

  @LocalStorage() showWbcRouteTableInfo;

  @ViewChild('textOrTranslationKey') textOrTranslationKeyTpl: TemplateRef<any>;
  @ViewChild('numberOrDocumentIds') numberOrDocumentIdsTpl: TemplateRef<any>;

  @Output() documentClick = new EventEmitter<string>();

  @Input() set data(data: any) {
    if (!data) {
      this.rows = undefined;
      this.columns = [];
    } else if (data.speciesStats.length === 0) {
      this.rows = [];
      this.columns = [];
    } else {
      this.rows = data.speciesStats.concat(data.otherStats);
      this.setColumns(data);
    }
  }

  constructor() { }

  ngOnInit() {
    if (this.showWbcRouteTableInfo === null) {
      this.showWbcRouteTableInfo = true;
    }
  }

  toggleInfo() {
    this.showWbcRouteTableInfo = !this.showWbcRouteTableInfo;
  }

  onSort(event) {
    const speciesStats = this.rows.slice(0, -3);
    const otherStats = this.rows.slice(-3);
    event.sorts.forEach((sort) => {
      const comparator = this.getSortingComparator(sort.prop);
      const dir = sort.dir === 'asc' ? 1 : -1;
      speciesStats.sort((a, b) => dir * comparator(a[sort.prop], b[sort.prop]));
    });
    this.rows = speciesStats.concat(otherStats);
  }

  setColumns(data) {
    this.columns = [{
      name: 'name',
      label: 'result.unit.taxonVerbatim',
      cellTemplate: this.textOrTranslationKeyTpl,
      frozenLeft: true
    }];

    for (let i = data.years[0]; i <= data.years[data.years.length - 1]; i++) {
      this.columns.push({
        name: i + '',
        label: i + '/' + (i + 1),
        width: 85,
        cellTemplate: this.numberOrDocumentIdsTpl,
        cellClass: this._getCellClass
      });
    }

    this.columns.push({
      name: 'mean',
      label: 'wbc.stats.route.mean',
      width: 85,
      cellTemplate: this.numberOrDocumentIdsTpl,
      cellClass: 'mean'
    });
    this.columns.push({
      name: 'median',
      label: 'wbc.stats.route.median',
      width: 85,
      cellTemplate: this.numberOrDocumentIdsTpl,
      cellClass: 'median'
    });
  }

  private getRowClass(row: any) {
    if (this.isLastRow(row)) {
      return 'last-rows';
    }
    return '';
  }

  private getCellClass(data: any) {
    const classes = [''];

    if (typeof data.value === 'number' && !this.isLastRow(data.row)) {
      if (data.row.mean >= 5) {
        if (data.value >= (data.row.mean * 2)) {
          classes.push('significantly-more');
        } else if (data.value <= (data.row.mean / 2)) {
          classes.push('significantly-less');
        }
      }

      if (data.value === data.row.max) {
        classes.push('max');
      } else if (data.value === data.row.min) {
        classes.push('min');
      }
    }

    return classes.join(' ');
  }

  private isLastRow(row: any) {
    return row.name === 'speciesCount' || row.name === 'individualCount' || row.name === 'documentIds';
  }

  private getSortingComparator(prop: string): (a, b) => number {
    if (prop === 'name') {
      return (a, b) => {
        return (a).localeCompare(b);
      };
    }

    return (a, b) => {
      a = parseInt(a, 10);
      b = parseInt(b, 10);
      return a - b;
    };
  }

  roundNumber(value: number) {
    return Math.round(value * 10 ) / 10;
  }
}
