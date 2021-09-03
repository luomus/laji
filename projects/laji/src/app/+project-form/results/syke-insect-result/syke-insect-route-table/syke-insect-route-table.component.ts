import { Component, EventEmitter, Input, ChangeDetectionStrategy,
Output, TemplateRef, ViewChild, OnInit, OnChanges } from '@angular/core';
import { DatatableColumn } from '../../../../shared-modules/datatable/model/datatable-column';
import { ExportService } from '../../../../shared/service/export.service';
import { TranslateService } from '@ngx-translate/core';
import { BookType } from 'xlsx';
import { DateFormatPipe } from 'ngx-moment';


@Component({
  selector: 'laji-syke-insect-route-table',
  templateUrl: './syke-insect-route-table.component.html',
  styleUrls: ['./syke-insect-route-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SykeInsectRouteTableComponent implements OnInit, OnChanges {
  @Input() routeId: string;
  @Input() season: string;
  @Input() sorts: {prop: string, dir: 'asc'|'desc'}[] = [];
  @Input() activeYear;
  @Input() year = '';
  @Input() filter = '';
  @Input() taxonSet;
  @Input() loading = false;
  @Input() onlySections = true;

  rows: any[];
  columns: DatatableColumn[] = [];

  _getRowClass: (data: any) => string = this.getRowClass.bind(this);
  _getCellClass: (data: any) => string = this.getCellClass.bind(this);

  downloadLoading = false;

  @ViewChild('textOrTranslationKey', { static: true }) textOrTranslationKeyTpl: TemplateRef<any>;
  @ViewChild('numberOrDocumentIds', { static: true }) numberOrDocumentIdsTpl: TemplateRef<any>;

  @Output() documentClick = new EventEmitter<string>();

  @Input() set data(data: any) {
    if (!data) {
      this.rows = undefined;
    } else if (data.length === 0) {
      this.rows = [];
    } else {
      this.rows = data;
    }
  }

  constructor(
    private translate: TranslateService,
    private exportService: ExportService,
    private dateFormat: DateFormatPipe
  ) { }

  ngOnInit() {
    this.setColumns(this.rows);
  }

  ngOnChanges() {
    this.setColumns(this.rows);
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
    if (!this.rows || this.rows.length === 0) {
      return;
    }

    this.columns = [
      {
        name: 'vernacularName',
        label: 'taxonomy.vernacular.name',
        cellTemplate: 'multiLang',
        width: 150
      },
      {
        name: 'scientificName',
        label: 'taxonomy.scientific.name',
        cellTemplate: 'taxonScientificName',
        width: 150
      },
    ];

    const totalColumn = {
      name: 'total',
      label: 'taxonomy.total',
      width: 100,
      cellTemplate: this.textOrTranslationKeyTpl,
    };

    if (this.year === '' || this.year === undefined) {
      this.columns.unshift(totalColumn);
    } else {
      this.columns.push(totalColumn);
    }

    let otherCols = [];

    data.forEach(element => {
      for (const key in element) {
        if (key.startsWith('gathering') || key.startsWith('year') || (key.startsWith('day') && key.includes(this.year) )) {
          otherCols.push(key.substring(key.indexOf('_') + 1));
        }
      }
    });

    otherCols = otherCols.filter((el, index) => {
      return otherCols.indexOf(el) === index;
    });

    if (this.filter !== 'gathering.conversions.year') {
      otherCols.sort((a, b) => a - b);
    } else {
      if (!this.onlySections) {
        otherCols = this.sortDate(otherCols);
      }
    }

    for (let i = 0; i <= otherCols.length - 1; i++) {
      this.columns.push({
        name: otherCols[i] === 0 ? 'gatheringSection_undefined' : (!this.year ? 'year_' + otherCols[i] :
        (this.season ? 'gatheringSection_' + otherCols[i] : !this.onlySections ? 'day_' + otherCols[i] : 'gatheringSection_' + otherCols[i])),
        label: otherCols[i] === 'undefined' ? this.translate.instant('gathering.section.outsideSection') :
        (this.onlySections ? otherCols[i] + '' : this.dateFormat.transform(this.reverseDate(otherCols[i]), 'L')),
        width: otherCols[i] === 'undefined' ? 120 : 60,
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
      'census_' + this.routeId.split('.')[1] +
      (this.year ? '_' + this.year : '') +
      (this.season ? '_' + this.season : '')
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
        const value = this.rows[i][this.columns[j].name];
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

  private sortDate(array) {
    array = array.map(this.reverseDate)
    .sort()
    .map(this.reverseDate);

    return array;
  }

  reverseDate(date) {
    const parts = date.split('-');
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
}
