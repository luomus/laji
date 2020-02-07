import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface IFileLoad {
  filename: string;
  content: any;
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
    const reader: FileReader = new FileReader();
    let filename = '';

    return new Observable(subscriber => {
      if (target.files.length !== 1) {
        return subscriber.error(FileService.ERROR_NO_FILE);
      }
      reader.onload = (e: any) => {
        subscriber.next({
          filename,
          content: e.target.result
        });
        subscriber.complete();
      };
      reader.onerror = () => {
        return subscriber.error(FileService.ERROR_GENERIC);
      };
      if (validTypes && validTypes.includes(target.files[0].type)) {
        filename = target.files[0].name;
        reader.readAsArrayBuffer(target.files[0]);
      } else {
        return subscriber.error(FileService.ERROR_INVALID_TYPE);
      }
    });
  }
}
