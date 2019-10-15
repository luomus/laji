import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import {utils as XLSXUtils} from 'xlsx';

@Injectable({providedIn: 'root'})
export class ExportService {
  private csvMimeType = 'text/csv;charset=utf-8';
  private tsvMimeType = 'text/tab-separated-values';
  private odsMimeType = 'application/vnd.oasis.opendocument.spreadsheet';
  private xlsxMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  constructor() { }

  exportArrayBuffer(buffer: any, fileName: string, fileExtension: string) {
    let type;
    if (fileExtension === 'ods') {
      type = this.odsMimeType;
    } else if (fileExtension === 'xlsx') {
      type = this.xlsxMimeType;
    } else if (fileExtension === 'tsv') {
      type = this.tsvMimeType;
    } else {
      type = this.csvMimeType;
    }

    const data: Blob = new Blob([buffer], {
      type: type
    });

    FileSaver.saveAs(data, fileName + '.' + fileExtension);
  }

  getBufferFromAoa(aoa: string[][], fileType: any): any {
    const sheet = XLSX.utils.aoa_to_sheet(aoa);

    if (fileType === 'csv') {
      return XLSXUtils.sheet_to_csv(sheet);
    }

    if (fileType === 'tsv') {
      return XLSX.utils.sheet_to_csv(sheet, {FS: '\t'});
    }

    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet);

    return XLSX.write(book, {bookType: fileType, type: 'array'});
  }
}
