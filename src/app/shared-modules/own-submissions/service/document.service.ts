import { Injectable } from '@angular/core';
import { DocumentApi } from '../../../shared/api/DocumentApi';
import { UserService } from '../../../shared/service/user.service';
import { Document } from '../../../shared/model/Document';
import { Util } from '../../../shared/service/util.service';
import { Observable } from 'rxjs/Observable';
import { TemplateForm } from '../models/template-form';

@Injectable()
export class DocumentService {

  private removableUnit = [
    'images',
    'dateBegin',
    'dateEnd',
    'timeStart',
    'timeEnd',
    'notes',
    'observationDays',
    'observationMinutes',
    'weather',
    'abundanceString',
    'count',
    'maleIndividualcount',
    'femaleIndividualcount',
    'sex',
    'hostID',
    'taste',
    'tasteNotes',
    'smell',
    'smellNotes',
    'plantStatusCode',
    'movingStatus'
  ];

  private removableGathering = [
    'units',
    'images',
    'dateBegin',
    'dateEnd',
    'timeStart',
    'timeEnd',
    'notes',
    'observationDays',
    'observationMinutes',
    'weather'
  ];

  constructor(private documentApi: DocumentApi, private userService: UserService) { }

  deleteDocument(id: string) {
    return this.documentApi.delete(id, this.userService.getToken());
  }

  saveTemplate(templateData: TemplateForm): Observable<Document> {
    const template: Document = Util.clone(templateData.document);
    this.removeMeta(template, templateData.type === 'unit' ? this.removableUnit : this.removableGathering);
    template.isTemplate = true;
    template.templateName = templateData.name;
    template.templateDescription = templateData.description;
    return this.documentApi.create(template, this.userService.getToken());
  }

  removeMeta(document: any, remove = []): any {
    if (remove.indexOf('id') === -1) {
      remove = remove.concat(['id', 'dateEdited', 'dateCreated', 'publicityRestrictions']);
    }
    if (Array.isArray(document)) {
      return document.map((value) => this.removeMeta(value, remove));
    } else if (typeof document === 'object') {
      Object.keys(document).map(key => {
        if (key.startsWith('@') || remove.indexOf(key) > -1) {
          delete document[key];
          return;
        }
        document[key] = this.removeMeta(document[key], remove);
      });
    }
    return document;
  }

}
