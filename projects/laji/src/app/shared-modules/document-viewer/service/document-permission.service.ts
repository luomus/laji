import { Injectable } from '@angular/core';
import { IdService } from '../../../shared/service/id.service';
import { Document } from '../../../shared/model/Document';
import { Person } from '../../../shared/model/Person';
import { Observable, of } from 'rxjs';
import { FormPermissionService } from '../../../shared/service/form-permission.service';
import { switchMap, map } from 'rxjs/operators';
import { UserService } from '../../../shared/service/user.service';
import { FormService } from '../../../shared/service/form.service';
import { DocumentService } from '../../own-submissions/service/document.service';

export interface DocumentRights {
  isEditor: boolean;
  hasEditRights: boolean;
  hasDeleteRights: boolean;
}

@Injectable({ providedIn: 'root' })
export class DocumentPermissionService {
  constructor(
    private userService: UserService,
    private documentService: DocumentService,
    private formService: FormService,
    private formPermissionService: FormPermissionService
  ) {}

  getRightsToWarehouseDocument(doc?: any): Observable<DocumentRights> {
    return this.userService.user$.pipe(
      switchMap(user => {
        if (!user || !doc) {
          return of({ isEditor: false, hasEditRights: false, hasDeleteRights: false });
        }

        const editors = doc.linkings?.editors?.map(editor => IdService.getId(editor.id)).filter(id => !!id) || [];
        const isEditor = editors.includes(user.id);

        const formId = IdService.getId(doc.formId);
        const collectionId = IdService.getId(doc.collectionId);

        return this.userIsFormAdmin(user, formId, collectionId, this.userService.getToken()).pipe(
          switchMap(isFormAdmin => {
            if (isFormAdmin) {
              return of({ isEditor, hasEditRights: true, hasDeleteRights: true });
            }

            const documentId = IdService.getId(doc.documentId);

            if (!(isEditor || editors.length === 0) || !documentId) {
              return of({ isEditor, hasEditRights: isEditor, hasDeleteRights: false });
            }

            return this.documentService.findById(documentId).pipe(
              map(localDoc => ({
                isEditor: isEditor || localDoc.editor === user.id,
                hasEditRights: isEditor || localDoc.editor === user.id,
                hasDeleteRights: localDoc.creator === user.id
              }))
            );
          })
        );
      })
    );
  }

  getRightsToLocalDocument(doc?: Document): Observable<DocumentRights> {
    return this.userService.user$.pipe(
      switchMap(user => {
        if (!user || !doc) {
          return of({ isEditor: false, hasEditRights: false, hasDeleteRights: false });
        }

        const isFormAdmin$ = this.userIsFormAdmin(user, doc.formID, doc.collectionID, this.userService.getToken());

        return isFormAdmin$.pipe(
          map(isFormAdmin => ({
            isEditor: doc.editor === user.id,
            hasEditRights: isFormAdmin || doc.editor === user.id,
            hasDeleteRights: isFormAdmin || doc.creator === user.id
          }))
        );
      })
    );
  }

  private userIsFormAdmin(user: Person, formId?: string, collectionId?: string, personToken?: string): Observable<boolean> {
    if (!formId || !collectionId) {
      return of(false);
    }

    return this.formService.getForm(formId).pipe(
      switchMap(form => {
        if (!form.options?.hasAdmins) {
          return of(false);
        }
        return this.formPermissionService.getFormPermission(collectionId, personToken).pipe(
          map(formPermission => this.formPermissionService.isAdmin(formPermission, user))
        );
      })
    );
  }
}
