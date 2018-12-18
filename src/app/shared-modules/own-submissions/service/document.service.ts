import { Injectable } from '@angular/core';
import { DocumentApi } from '../../../shared/api/DocumentApi';
import { UserService } from '../../../shared/service/user.service';
import { Document } from '../../../shared/model/Document';
import { Util } from '../../../shared/service/util.service';
import { Observable } from 'rxjs';
import { TemplateForm } from '../models/template-form';
const { JSONPath } = require('jsonpath-plus');

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
    '$..notes',
    '$..observationDays',
    '$..observationMinutes',
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

  constructor(private documentApi: DocumentApi, private userService: UserService) { }

  deleteDocument(id: string) {
    return this.documentApi.delete(id, this.userService.getToken());
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

}
