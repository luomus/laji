import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import * as XLSX from 'xlsx';
import { FieldType, IColumnMap, ILabelField } from '../../label-designer.interface';
import { LabelService } from '../../label.service';

export interface ILoadData {
  data: any[];
  availableFields?: ILabelField[];
}

/**
 * @internal
 */
@Component({
  selector: 'll-label-excel-file',
  templateUrl: './label-excel-file.component.html',
  styleUrls: ['./label-excel-file.component.scss']
})
export class LabelExcelFileComponent {

  @Input() defaultDomain?: string;
  @Input({ required: true }) availableFields!: ILabelField[];
  @Output() columnMapChange = new EventEmitter<IColumnMap>();
  idField = '_id';
  domainField = '_domain';
  dataStarts = 2;
  hasColumnMap = false;

  wb?: XLSX.WorkBook;
  filename?: string;
  sheets: string[] = [];
  headers: string[] = [];
  uriCol?: string;
  importFields = true;
  data?: {[key: string]: string}[];

  private _columnMap: IColumnMap = {};

  constructor(
    private cdr: ChangeDetectorRef
  ) { }

  @Input()
  set columnMap(map: IColumnMap|undefined) {
    if (!map || Object.keys(map).length === 0) {
      this.hasColumnMap = false;
      this._columnMap = {};
      return;
    }
    this.hasColumnMap = true;
    this._columnMap = map;
  }

  get columnMap(): IColumnMap {
    return this._columnMap;
  }

  onExcelFileChange(evt: any): void {
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

  loadFile(data: any): void {
    this.wb = XLSX.read(data, {type: 'array'});
    this.sheets = this.wb.SheetNames;
    this.loadSheet(this.sheets[0]);
  }

  loadSheet(name: string): void {
    const sheet: XLSX.WorkSheet = this.wb!.Sheets[name];
    const rows: {[key: string]: string}[] = <any>XLSX.utils.sheet_to_json<{[key: string]: string}>(sheet, {raw: false});
    if (Array.isArray(rows) && rows.length > 0) {
      this.headers = Object.keys(rows[0]);
    } else {
      this.headers = [];
    }
    this.uriCol = this.headers[0];
    this.cdr.detectChanges();
    this.data = rows;
  }

  changeIdCol(value: any): void {
    this.uriCol = value;
  }

  loadData(): ILoadData {
    const start = this.dataStarts > 1 ? this.dataStarts : 2;
    if (!this.data || this.data.length < start) {
      return {
        availableFields: undefined,
        data: []
      };
    }
    if (this.hasColumnMap) {
      return this.loadColumnMappedData(start);
    }
    return {
      availableFields: this.importFields ? this.getFields() : undefined,
      data: this.data.slice(start - 2).map(row => {
        const uri = this.makeUri(row[this.uriCol!]);
        const parsedUri = LabelService.parseUri(uri);
        const rowData = {
          ...row,
          [this.uriCol!]: uri,
          [this.idField]: parsedUri.id
        };
        if (parsedUri.domain) {
          rowData[this.idField] = parsedUri.id;
          rowData[this.domainField] = parsedUri.domain;
        }
        return rowData;
      })
    };
  }

  private loadColumnMappedData(start: number): ILoadData {
    const cols = Object.keys(this.columnMap).filter(v => !!v);
    const fieldMap: {[key: string]: ILabelField} = this.availableFields.reduce((cumulative, current) => {
      cumulative[current.field] = current;
      return cumulative;
    }, {} as Record<string, ILabelField>);
    return {
      availableFields: undefined,
      data: this.data!.slice(start - 2).map(row => {
        const rowData: Record<string, any> = {};
        cols.forEach(col => {
          if (rowData[this.columnMap[col]]) {
            if (fieldMap[this.columnMap[col]].isArray) {
              if (!Array.isArray(rowData[this.columnMap[col]])) {
                rowData[this.columnMap[col]] = [rowData[this.columnMap[col]]];
              }
              rowData[this.columnMap[col]].push(row[col]);
            }
          } else {
            rowData[this.columnMap[col]] = row[col];
          }
        });
        return rowData;
      })
    };
  }

  private makeUri(val: any): string {
    if (typeof val === 'string' && val.indexOf('http') !== 0) {
      return ('' + this.defaultDomain) + val;
    }
    return val;
  }

  private getFields(): ILabelField[] {
    const ex = this.data![0] || {};
    const fields: ILabelField[] = [
      {
        label: this.uriCol + ' - QRCode',
        field: this.uriCol!,
        content: ex[this.uriCol!] || 'http://example.com/123',
        type: FieldType.qrCode
      },
      {
        label: this.uriCol!,
        field: this.uriCol!,
        content: ex[this.uriCol!] || 'http://example.com/123',
        type: FieldType.uri
      },
    ];
    const uri = this.makeUri(ex[this.uriCol!]);
    const parsedUri = LabelService.parseUri(uri);
    if (parsedUri.domain) {
      fields.push({
        label: 'domain',
        field: this.domainField,
        content: parsedUri.domain,
        type: FieldType.domain
      });
      fields.push({
        label: 'ID',
        field: this.idField,
        content: parsedUri.id,
        type: FieldType.id
      });
    }
    fields.push({
      label: 'Text',
      field: '_any_text_',
      content: 'Text',
      type: FieldType.text
    });
    return [
      ...fields,
      ...this.headers.reduce((cumulative, current) => {
        if (current !== this.uriCol) {
          cumulative.push({
            field: current,
            label: current,
            content: ex[current]
          });
        }
        return cumulative;
      }, [] as ILabelField[])
    ];
  }

  onColumnMap(header: string, field: ILabelField): void {
    this.columnMap = {...this.columnMap, [header]: field.field};
    this.columnMapChange.emit(this.columnMap);
  }
}
