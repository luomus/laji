import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';

@Injectable({providedIn: 'root'})
export class ExportService {
  private csvMimeType = 'text/csv;charset=utf-8';
  private tsvMimeType = 'text/tab-separated-values';
  private odsMimeType = 'application/vnd.oasis.opendocument.spreadsheet';
  private xlsxMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  constructor() { }

  exportBuffer(buffer: any, fileName: string, fileExtension: string) {
    fileName = fileName.replace('ä', 'a');

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

}
