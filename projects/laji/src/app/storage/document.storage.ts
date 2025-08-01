import { Injectable } from '@angular/core';
import { PlatformService } from '../root/platform.service';
import { LocalDb } from '../shared/local-db/local-db.abstract';
import { Document } from '../shared/model/Document';
import { EMPTY, from, Observable, of, Subject } from 'rxjs';
import { Person } from '../shared/model/Person';
import { catchError, map, mergeMap, switchMap, tap, toArray } from 'rxjs/operators';
import { FormService } from '../shared/service/form.service';

@Injectable({providedIn: 'root'})
export class DocumentStorage extends LocalDb<Document & { id: string }> {

  private deletesSource = new Subject();
  deletes$ = this.deletesSource.asObservable();

  static key(documentId: string, person: string | Person): string {
    if (!person || !documentId) {
      return '';
    }
    return DocumentStorage.prefix(person) + documentId;
  }

  private static prefix(person: string | Person) {
    return (typeof person === 'string' ? person : person.id) + '-';
  }

  constructor(
    private platformService: PlatformService
  ) {
    super('observation', platformService.isBrowser);
  }

  removeItem(key: string, person?: string | Person): Observable<void> {
    if (!this.isPlatformBrowser) {
      return EMPTY;
    }
    const itemId = person ? DocumentStorage.key(key, person) : key;
    return from(this.db.removeItem(itemId)).pipe(
      tap(() => this.deletesSource.next()),
      catchError(() => EMPTY),
    );
  }

  getItem(key: string, person?: string | Person): Observable<Document & { id: string } | null> {
    if (person) {
      return super.getItem(DocumentStorage.key(key, person));
    }
    return super.getItem(key);
  }

  setItem(key: string, value: Document & { id: string }, person?: string | Person): Observable<Document & { id: string }> {
    if (person) {
      return super.setItem(DocumentStorage.key(key, person), value);
    }
    return super.setItem(key, value);
  }

  getAllKeys(person: string | Person, type?: 'onlyTmp'|'onlyDoc'): Observable<string[]> {
    if (!person) {
      return of([]);
    }
    const prefix = DocumentStorage.prefix(person);

    return from(this.db.keys()).pipe(
      map(keys => keys.filter(key => {
        if (!type) {
          return key.indexOf(prefix) === 0;
        } else if (key.indexOf(prefix) !== 0) {
          return false;
        }
        const isTmp = FormService.isTmpId(key.replace(prefix, ''));
        return type === 'onlyTmp' ? isTmp : !isTmp;
      }))
    );
  }

  getAll(person: string | Person, type?: 'onlyTmp'|'onlyDoc'): Observable<(Document | null)[]> {
    return this.getAllKeys(person, type).pipe(
      switchMap(keys => from(keys)),
      mergeMap((key) => this.getItem(key)),
      toArray()
    );
  }

  getUnlinkedTmpDocs$(): Observable<(Document | null)[]> {
    return from(this.db.keys()).pipe(
      map(keys => keys.filter(key => FormService.isTmpId(key))),
      switchMap(keys => from(keys)),
      mergeMap((key) => this.getItem(key)),
      toArray()
    );
  }

  clearUnlinkedTmpDocs$(): Observable<void> {
    return this.getUnlinkedTmpDocs$().pipe(
      mergeMap(docs => from(docs)),
      mergeMap(doc => doc && doc.id ? this.removeItem(doc.id) : EMPTY),
      toArray(),
      map(() => {})
    );
  }
}
