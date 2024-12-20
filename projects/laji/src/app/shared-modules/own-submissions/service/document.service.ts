import { Injectable } from '@angular/core';
import { DocumentApi } from '../../../shared/api/DocumentApi';
import { UserService } from '../../../shared/service/user.service';
import { Document } from '../../../shared/model/Document';
import { Util } from '../../../shared/service/util.service';
import { Observable, of } from 'rxjs';
import { TemplateForm } from '../models/template-form';
import { DocumentStorage } from '../../../storage/document.storage';
import { mergeMap, switchMap, shareReplay, tap, take } from 'rxjs/operators';
import { Rights } from '../../../shared/service/form-permission.service';
import { Person } from '../../../shared/model/Person';
import { JSONPath } from 'jsonpath-plus';
import { FormService } from '../../../shared/service/form.service';

export enum Readonly {
  noEdit,
  false,
  true
}

@Injectable()
export class DocumentService {

  private cache: Record<string, Observable<Document>> = {};

  constructor(
    private documentApi: DocumentApi,
    private userService: UserService,
    private documentStorage: DocumentStorage,
    private formService: FormService
  ) { }

  findById(id: string): Observable<Document> {
    const cacheKey = this.getCacheKey(id);
    if (!this.cache[cacheKey]) {
      this.cache[cacheKey] = this.documentApi.findById(id, this.userService.getToken()).pipe(shareReplay());
    }
    return this.cache[cacheKey];
  }

  create(document: Document) {
    return this.documentApi.create(document, this.userService.getToken()).pipe(tap(d => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.cache[this.getCacheKey(d.id!)] = of(d);
    }));
  }

  update(id: string, document: Document) {
    return this.documentApi.update(id, document, this.userService.getToken()).pipe(tap(d => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.cache[this.getCacheKey(d.id!)] = of(d);
    }));
  }

  deleteDocument(id: string) {
    const isTmpDoc = FormService.isTmpId(id);
    const del$ = isTmpDoc
      ? this.userService.user$.pipe(take(1), tap(person => {
        this.documentStorage.removeItem(id, person);
      }))
      : this.documentApi.delete(id, this.userService.getToken());
    return del$.pipe(tap(() => delete this.cache[this.getCacheKey(id)]));
  }

  saveTemplate(templateData: TemplateForm): Observable<Document> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.formService.getForm(templateData.document!.formID!).pipe(switchMap(form => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const template: Document = this.removeMeta(templateData.document, form!.excludeFromCopy);
      template.isTemplate = true;
      template.templateName = templateData.name;
      template.templateDescription = templateData.description;
      return this.documentApi.create(template, this.userService.getToken());
    }));
  }

  removeMeta(document: any, remove: string[] = []): any {
    document = Util.clone(document);

    if (['$.id', '$..id'].every(idField => remove.indexOf(idField) === -1)) {
      remove = [...remove, '$..id', '$..dateEdited', '$..dateCreated', '$..publicityRestrictions', '$..locked'];
    }
    remove.forEach(path => JSONPath({
        json: document, path, callback: (v, t, payload) => {
          delete payload.parent[payload.parentProperty];
        }
      })
    );
    removeAtRecursively(document);
    return document;

    function removeAtRecursively(_document: any): any {
      if (Array.isArray(_document)) {
        return _document.map(removeAtRecursively);
      } else if (typeof _document === 'object') {
        Object.keys(_document).map(key => {
          if (key.startsWith('@')) {
            delete _document[key];
            return;
          }
          removeAtRecursively(_document[key]);
        });
      }

      return document;
    }
  }

  combine(to: any, from: any) {
    if (typeof to === 'object' && typeof from === 'object' && !Array.isArray(from)) {
      Object.keys(from).forEach(key => {
        if (typeof to[key] === 'undefined') {
          to[key] = from[key];
        }
      });
    }
    return to;
  }

  getReadOnly(data: Document, rights: Rights, person?: Person): Readonly {
    if (rights.admin) {
      return Readonly.false;
    }
    if (person && person.id && data && data.id && data.creator !== person.id && (!data.editors || data.editors.indexOf(person.id) === -1)) {
      return Readonly.noEdit;
    }
    return data && typeof data.locked !== 'undefined' ? (data.locked ? Readonly.true : Readonly.false) : Readonly.false;
  }

  private getCacheKey(documentID: string) {
    return `${documentID}:${this.userService.getToken()}`;
  }

}
