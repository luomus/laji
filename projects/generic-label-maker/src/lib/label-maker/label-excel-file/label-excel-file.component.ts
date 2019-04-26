import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { ILabelField } from '../../generic-label-maker.interface';

@Component({
  selector: 'll-label-excel-file',
  templateUrl: './label-excel-file.component.html',
  styleUrls: ['./label-excel-file.component.scss']
})
export class LabelExcelFileComponent implements OnInit {

  @Input() defaultDomain;

  wb: XLSX.WorkBook;
  filename: string;
  sheets: string[] = [];
  headers: string[] = [];
  idCol: string;
  importFields = true;
  data: {[key: string]: string}[];

  constructor(
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
  }

  onExcelFileChange(evt) {
    const target: DataTransfer = <DataTransfer>(evt.target);
    if (target.files.length !== 1) {
      return;
    }
    const reader: FileReader = new FileReader();
    this.filename = evt.target.value;
    reader.onload = (e: any) => {
      evt.target.value = '';
      this.loadFile(e.target.result);
    };
    reader.readAsArrayBuffer(target.files[0]);
  }

  loadFile(data: any) {
    this.wb = XLSX.read(data, {type: 'array'});
    this.sheets = this.wb.SheetNames;
    this.loadSheet(this.sheets[0]);
  }

  loadSheet(name: string) {
    const sheet: XLSX.WorkSheet = this.wb.Sheets[name];
    const rows: {[key: string]: string}[] = <any>XLSX.utils.sheet_to_json<{[key: string]: string}>(sheet, {raw: false});
    if (Array.isArray(rows) && rows.length > 0) {
      this.headers = Object.keys(rows[0]);
    } else {
      this.headers = [];
    }
    this.idCol = this.headers[0];
    this.cdr.detectChanges();
    this.data = rows;
  }

  changeIdCol(value: any) {
    this.idCol = value;
  }

  loadData() {
    return {
      availableFields: this.importFields ? this.getFields() : undefined,
      data: this.data.map(row => ({
        ...row,
        [this.idCol]: this.makeUri(row[this.idCol])
      }))
    };
  }

  private makeUri(val) {
    if (typeof val === 'string' && val.indexOf('http') !== 0) {
      return ('' + this.defaultDomain) + val;
    }
    return val;
  }

  private getFields(): ILabelField[] {
    const ex = this.data[0] || {};
    return [
      {
        label: this.idCol + ' - QRCode',
        field: this.idCol,
        content: ex[this.idCol] || 'http://example.com/123',
        type: 'qr-code'
      },
      {
        label: this.idCol,
        field: this.idCol,
        content: ex[this.idCol] || 'http://example.com/123',
        type: 'id'
      },
      {
        label: 'Text',
        field: '_any_text_',
        type: 'text'
      },
      ...this.headers.reduce((cumulative, current) => {
        if (current !== this.idCol) {
          cumulative.push({
            field: current,
            label: current,
            content: ex[current]
          });
        }
        return cumulative;
      }, [])
    ];
  }
}
