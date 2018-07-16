import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { Observable, forkJoin as ObservableForkJoin } from 'rxjs';
import { TriplestoreLabelService } from '../../shared/service/triplestore-label.service';
import { MultiLangService } from '../../shared-modules/lang/service/multi-lang.service';
import { PublicationService } from '../../shared/service/publication.service';
import { Publication } from '../../shared/model/Publication';
import { UserService } from '../../shared/service/user.service';
import { Person } from '../../shared/model/Person';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class TaxonExportService {
  private tsvMimeType = 'text/tab-separated-values';
  private odsMimeType = 'application/vnd.oasis.opendocument.spreadsheet';
  private xlsxMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  constructor(
    private translate: TranslateService,
    private labelService: TriplestoreLabelService,
    private publicationService: PublicationService,
    private userService: UserService
  ) {}

  public downloadTaxons(columns, data, type = 'tsv'): Observable<boolean> {
    return this.getBuffer(columns, data, type).switchMap((buffer) => {
      return this.translate.get('taxon-export').map((fileName) => {
        this.downloadData(buffer, fileName, type);
        return true;
      });
    });
  }

  private downloadData(buffer: any, fileName: string, fileExtension: string) {
    fileName = fileName.replace('ä', 'a');

    let type;
    if (fileExtension === 'ods') {
      type = this.odsMimeType;
    } else if (fileExtension === 'xlsx') {
      type = this.xlsxMimeType;
    } else {
      type = this.tsvMimeType;
    }

    const data: Blob = new Blob([buffer], {
      type: type
    });

    FileSaver.saveAs(data, fileName + '.' + fileExtension);
  }

  private getBuffer(cols, data, type): Observable<string> {
    return this.getAoa(cols, data).map((aoa) => {
      const sheet = XLSX.utils.aoa_to_sheet(aoa);

      if (type === 'tsv') {
        return XLSX.utils.sheet_to_csv(sheet, {FS: '\t'});
      }

      const book = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(book, sheet);

      return XLSX.write(book, {bookType: type, type: 'buffer'});
    });
  }

  private getAoa(cols, data): Observable<string[][]> {
    const aoa = [[]];

    const observables = [];
    for (let i = 0; i < cols.length; i++) {
      aoa[0].push(cols[i].label);
      observables.push(
        this.translate.get(cols[i].label).do((label) => {
          aoa[0][i] = label;
        })
      );
    }
    for (let i = 0; i < data.length; i++) {
      aoa.push([]);
      for (let j = 0; j < cols.length; j++) {
        const value = cols[j].name.split('/').reduce((o, s) => {
          return o[s];
        }, data[i]);
        const template = cols[j].cellTemplate;
        aoa[i + 1].push(value);

        if (value === undefined || value === null || !template) {
          continue;
        }

        let observable;
        switch (template) {
          case 'label':
          case 'labelArray':
            observable = this.getLabels(value);
            break;
          case 'multiLang':
            aoa[i + 1][j] = MultiLangService.getValue(value, this.translate.currentLang, '%value% (%lang%)');
            break;
          case 'multiLangAll':
            aoa[i + 1][j] = MultiLangService.valueToString(value);
            break;
          case 'boolean':
            if (value === true) {
              observable = this.translate.get('datatable.yes');
            } else {
              observable = this.translate.get('datatable.no');
            }
            break;
          case 'publication':
          case 'publicationArray':
            observable = this.getPublications(value);
            break;
          case 'iucnStatus':
            aoa[i + 1][j] = value.status.replace('MX.iucn', '') + ' (' + value.year + ')';
            break;
          case 'user':
            observable = this.getUserName(value);
            break;
          default:
            break;
        }

        if (observable) {
          observables.push(observable.pipe(tap(((val) => {
            aoa[i + 1][j] = val;
          }))));
        }
      }
    }

    return ObservableForkJoin(observables).pipe(
      map(() => aoa)
    );
  }

  private getLabels(values): Observable<string> {
    if (!Array.isArray(values)) {
      values = [values];
    }
    const labelObservables = [];
    for (let i = 0; i < values.length; i++) {
      labelObservables.push(
        this.labelService.get(values[i], this.translate.currentLang)
      )
    }
    return ObservableForkJoin(labelObservables).pipe(
      map(labels => labels.join('; '))
    );
  }

  private getPublications(values): Observable<string> {
    if (!Array.isArray(values)) {
      values = [values];
    }
    const labelObservables = [];
    for (let i = 0; i < values.length; i++) {
      labelObservables.push(
        this.publicationService.getPublication(values[i], this.translate.currentLang)
          .map((res: Publication) => {
            return res && res['dc:bibliographicCitation'] ? res['dc:bibliographicCitation'] : values[i];
        })
      )
    }
    return ObservableForkJoin(labelObservables).pipe(
      map(labels => labels.join('; '))
    );
  }


  private getUserName(value): Observable<string> {
    return this.userService.getUser(value).map((user: Person) => (user.fullName || ''));
  }
}
