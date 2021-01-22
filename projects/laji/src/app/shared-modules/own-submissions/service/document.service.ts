import { Injectable } from '@angular/core';
import { DocumentApi } from '../../../shared/api/DocumentApi';
import { UserService } from '../../../shared/service/user.service';
import { Document } from '../../../shared/model/Document';
import { Util } from '../../../shared/service/util.service';
import { Observable } from 'rxjs';
import { TemplateForm } from '../models/template-form';
import { DocumentStorage } from '../../../storage/document.storage';
import { mergeMap, tap } from 'rxjs/operators';
import { Rights } from '../../../shared/service/form-permission.service';
import { Person } from '../../../shared/model/Person';
const { JSONPath } = require('jsonpath-plus');

export enum Readonly {
  noEdit,
  false,
  true
}

@Injectable()
export class DocumentService {

  public static readonly removableUnit = [
    '$..images',
    '$..dateBegin',
    '$..dateEnd',
    '$..timeStart',
    '$..timeEnd',
    '$..notes',
    '$..observationDays',
    '$..observationMinutes',
    '$..weather',
    '$..abundanceString',
    '$..count',
    '$..maleIndividualcount',
    '$..femaleIndividualcount',
    '$..sex',
    '$..hostID',
    '$..taste',
    '$..tasteNotes',
    '$..smell',
    '$..smellNotes',
    '$..plantStatusCode',
    '$..movingStatus'
  ];

  public static readonly removableGathering = [
    '$..units',
    '$..images',
    '$..dateBegin',
    '$..dateEnd',
    '$..timeStart',
    '$..timeEnd',
    '$..iceCover',
    '$..cloudAndRain',
    '$..meanTemperature',
    '$..snowAndIceOnTrees',
    '$..snowCover',
    '$..typeOfSnowCover',
    '$..visibility',
    '$..weather',
    '$..wind'
  ];

  constructor(
    private documentApi: DocumentApi,
    private userService: UserService,
    private documentStorage: DocumentStorage
  ) { }

  deleteDocument(id: string) {
    return this.documentApi.delete(id, this.userService.getToken()).pipe(
      mergeMap(() => this.userService.user$),
      tap(person => this.documentStorage.removeItem(id, person))
    );
  }

  saveTemplate(templateData: TemplateForm): Observable<Document> {
    const template: Document = Util.clone(templateData.document);
    this.removeMeta(template, templateData.type === 'unit' ? DocumentService.removableUnit : DocumentService.removableGathering);
    template.isTemplate = true;
    template.templateName = templateData.name;
    template.templateDescription = templateData.description;
    return this.documentApi.create(template, this.userService.getToken());
  }

  removeMeta(document: any, remove = []): any {
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

    function removeAtRecursively(_document: any) {
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
