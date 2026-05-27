import { Injectable } from '@angular/core';
import { UserService } from '../../../shared/service/user.service';
import * as Util from '../../../shared/utils';
import { Observable } from 'rxjs';
import { TemplateForm } from '../models/template-form';
import { DocumentStorage } from '../../../storage/document.storage';
import { switchMap, tap, take } from 'rxjs';
import { Rights } from '../../../shared/service/form-permission.service';
import { JSONPath } from 'jsonpath-plus';
import { FormService } from '../../../shared/service/form.service';
import type { components } from 'projects/laji-api-client/generated/api.d';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';

type Document = components['schemas']['store-document'];
type Person = components['schemas']['SensitivePerson'];

export enum Readonly {
  noEdit,
  false,
  true
}

@Injectable()
export class DocumentService {


  constructor(
    private userService: UserService,
    private documentStorage: DocumentStorage,
    private formService: FormService,
    private api: LajiApiClientService
  ) { }

  findById(id: string): Observable<Document> {
    return this.api.get('/documents/{id}', { path: { id } });
  }

  create(document: Document) {
    return this.api.post('/documents', undefined, document);
  }

  update(id: string, document: Document) {
    return this.api.put('/documents/{id}', { path: { id } }, document);
  }

  deleteDocument(id: string): Observable<any> {
    const isTmpDoc = FormService.isTmpId(id);
    if (isTmpDoc) {
      return this.userService.user$.pipe(
        take(1),
        tap(person => this.documentStorage.removeItem(id, person))
      );
    }
    return this.api.delete('/documents/{id}', { path: { id } });
  }

  saveTemplate(templateData: TemplateForm): Observable<Document> {
    return this.formService.getForm(templateData.document!.formID!).pipe(switchMap(form => {
      const template: Document = this.removeMeta(templateData.document, form!.excludeFromCopy);
      template.isTemplate = true;
      template.templateName = templateData.name;
      template.templateDescription = templateData.description;
      return this.api.post('/documents', undefined, template);
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
}
