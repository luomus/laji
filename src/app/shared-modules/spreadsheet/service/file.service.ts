import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { saveAs } from 'file-saver';

interface IFileLoad {
  filename: string;
  content: any;
  type: string;
}

export interface LoadOptions {
  type: 'arrayBuffer' | 'dataUrl';
}

export function instanceOfFileLoad(object: any): object is IFileLoad {
  return object && 'content' in object;
}

@Injectable({
  providedIn: 'root'
})
export class FileService {

  static ERROR_INVALID_TYPE = 'invalid type';
  static ERROR_NO_FILE = 'no file';
  static ERROR_GENERIC = 'file loading failed';

  /**
   * Loads the content of the file
   *
   * Event needs to be an event from file input field
   *
   * @example
   *  // component.html
   *  <input type="file" (change)="onFileChange($event)" />
   *
   *  // component.ts
   *  onFileChange(event: Event) {
   *    this.fileService.load(event).subscribe((data) => {
   *      // work with the file content
   *    })
   *  }
   */
  load(event: Event, validTypes?: string[]): Observable<IFileLoad> {
    const target = <HTMLInputElement> event.target;

    if (target.files.length !== 1) {
      return throwError(FileService.ERROR_NO_FILE);
    }

    return this.loadFile(target.files[0], validTypes);
  }

  loadFile(file: File, validTypes?: string[], options: LoadOptions = {type: 'arrayBuffer'}): Observable<IFileLoad> {
    const reader: FileReader = new FileReader();
    let filename = '';

    return new Observable(subscriber => {
      reader.onload = (e: any) => {
        subscriber.next({
          filename,
          content: e.target.result,
          type: file.type
        });
        subscriber.complete();
      };
      reader.onerror = () => {
        return subscriber.error(FileService.ERROR_GENERIC);
      };
      if (validTypes && !validTypes.includes(file.type)) {
        return subscriber.error(FileService.ERROR_INVALID_TYPE);
      } else {
        filename = file.name;
        switch (options.type) {
          case 'dataUrl':
            reader.readAsDataURL(file);
            break;
          default:
            reader.readAsArrayBuffer(file);
            break;
        }
      }
    });
  }

  save(filename: string, data: Blob): Observable<boolean> {
    saveAs(data, filename);
    return of(true);
  }
}
