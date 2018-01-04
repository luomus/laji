import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

import { FormField } from '../model/form-field';

@Injectable()
export class SpreadSheetService {

  private odsMimeType = 'application/vnd.oasis.opendocument.spreadsheet';
  private xlsxMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  constructor() { }

  generate(fields: FormField[], type: 'ods'|'xlsx' = 'xlsx') {
    const sheet = XLSX.utils.aoa_to_sheet([this.getHeaderRow(fields)]);
    const book = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(book, sheet);

    this.downloadData(XLSX.write(book, {bookType: type, type: 'buffer'}), 'vihko', type);
  }

  private getHeaderRow(fields: FormField[]) {
    return fields.map(field => field.label + '  -  ' + field.key);
  }

  private downloadData(buffer: any, fileName: string, fileExtension: string) {
    const type = fileExtension === 'ods' ? this.odsMimeType : this.xlsxMimeType;

    const data: Blob = new Blob([buffer], {
      type: type
    });

    FileSaver.saveAs(data, fileName + '.' + fileExtension);
  }

}
