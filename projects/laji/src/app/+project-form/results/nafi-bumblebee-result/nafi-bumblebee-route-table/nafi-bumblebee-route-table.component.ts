import { Component, EventEmitter, Input, OnInit, ChangeDetectionStrategy, Output, TemplateRef, ViewChild } from '@angular/core';
import { DatatableColumn } from '../../../../shared-modules/datatable/model/datatable-column';
import { LocalStorage } from 'ngx-webstorage';
import { ExportService } from '../../../../shared/service/export.service';
import { TranslateService } from '@ngx-translate/core';
import { SEASON } from '../nafi-bumblebee-result.service';
import { BookType } from 'xlsx';
import { filter } from 'jszip';

@Component({
  selector: 'laji-nafi-bumblebee-route-table',
  templateUrl: './nafi-bumblebee-route-table.component.html',
  styleUrls: ['./nafi-bumblebee-route-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NafiBumblebeeRouteTableComponent implements OnInit {
  @Input() routeId: string;
  @Input() season: SEASON;
  @Input() sorts: {prop: string, dir: 'asc'|'desc'}[] = [];
  @Input() year = '';

  rows: any[];
  columns: DatatableColumn[] = [];

  _getRowClass: (data: any) => string = this.getRowClass.bind(this);
  _getCellClass: (data: any) => string = this.getCellClass.bind(this);

  downloadLoading = false;

  @LocalStorage() showWbcRouteTableInfo;

  @ViewChild('textOrTranslationKey', { static: true }) textOrTranslationKeyTpl: TemplateRef<any>;
  @ViewChild('numberOrDocumentIds', { static: true }) numberOrDocumentIdsTpl: TemplateRef<any>;

  @Output() documentClick = new EventEmitter<string>();

  @Input() set data(data: any) {
    if (!data) {
      this.rows = undefined;
      this.columns = [];
    } else if (data.length === 0) {
      this.rows = [];
      this.columns = [];
    } else {
      this.rows = data;
      this.setColumns(data);
    }
  }

  constructor(
    private translate: TranslateService,
    private exportService: ExportService
  ) { }

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
    this.columns = [
      {
      name: 'unit.linkings.taxon.scientificName',
      label: 'result.unit.taxonVerbatim',
      cellTemplate: this.textOrTranslationKeyTpl,
      width: 150
      },
      {
        name: 'total',
        label: 'taxonomy.total',
        cellTemplate: this.textOrTranslationKeyTpl
      },

    ];

    const tmpCols = [];
    let gatheringSect = [];

    data.forEach(element => {
      for (const key in element) {
        if (key.startsWith('gathering') || key.startsWith('year')) {
          gatheringSect.push(key.substring(key.indexOf('_') + 1));
        }
      }
    });


    gatheringSect = gatheringSect.filter((el, index) => {
      return gatheringSect.indexOf(el) === index;
    });

    if (Math.min(...gatheringSect) > 1950) {
      gatheringSect.sort((a, b) => b - a);
    } else {
      gatheringSect.sort((a, b) => a - b);
    }


    for (let i = 0; i <= gatheringSect.length - 1; i++) {
      this.columns.push({
        name: gatheringSect[i] === 0 ? 'gatheringSection_undefined' : (gatheringSect[i] > 1950 ? 'year_' + gatheringSect[i] : 'gatheringSection_' + gatheringSect[i]),
        label: gatheringSect[i] === 0 ? this.translate.instant('gathering.section.outsideSection') : gatheringSect[i] + '',
        width: 40,
        cellTemplate: this.numberOrDocumentIdsTpl,
        cellClass: this._getCellClass
      });
    }

  }

  download(format: string) {
    this.downloadLoading = true;

    this.exportService.export(
      this.getAoa(),
      format as BookType,
      'route_' + this.routeId.split('.')[1] + '_' + this.season
    ).subscribe(() => {
      this.downloadLoading = false;
    });
  }

  private getAoa(): string[][] {
    const aoa = [[]];

    for (let i = 0; i < this.columns.length; i++) {
      aoa[0].push(this.translate.instant(this.columns[i].label));
    }
    for (let i = 0; i < this.rows.length; i++) {
      aoa.push([]);
      for (let j = 0; j < this.columns.length; j++) {
        let value = this.rows[i][this.columns[j].name];
        if (j === 0 && this.isLastRowName(value)) {
          value = this.translate.instant('wbc.stats.route.' + value);
        }
        const key = i + 1;
        aoa[key][j] = Array.isArray(value) ? value.join(', ') : value;
      }
    }
    return aoa;
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
    return this.isLastRowName(row.name);
  }

  private isLastRowName(name: string) {
    return 'ciao';
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
