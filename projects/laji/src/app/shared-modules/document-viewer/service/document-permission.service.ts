import { Injectable } from '@angular/core';
import { IdService } from '../../../shared/service/id.service';
import { Document } from '../../../shared/model/Document';
import { Person } from '../../../shared/model/Person';
import { Observable, of } from 'rxjs';
import { FormPermissionService } from '../../../shared/service/form-permission.service';
import { switchMap, map, catchError } from 'rxjs/operators';
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
    const rights: DocumentRights = { isEditor: false, hasEditRights: false, hasDeleteRights: false };

    return this.userService.user$.pipe(
      switchMap(user => {
        if (!user?.id || !doc) {
          return of(rights);
        }

        const editors = doc.linkings?.editors?.map(editor => IdService.getId(editor.id)).filter(id => !!id) || [];
        rights.isEditor = editors.includes(user.id);
        rights.hasEditRights = rights.isEditor;

        const collectionId = IdService.getId(doc.collectionId);

        return this.userIsFormAdmin(user, collectionId, this.userService.getToken()).pipe(
          switchMap(isFormAdmin => {
            if (isFormAdmin) {
              rights.hasEditRights = true;
              rights.hasDeleteRights = true;
              return of(rights);
            }

            const documentId = IdService.getId(doc.documentId);

            if (!(rights.isEditor || editors.length === 0) || !documentId) {
              return of(rights);
            }

            return this.documentService.findById(documentId).pipe(
              map(localDoc => {
                rights.isEditor = rights.isEditor || localDoc.editor === user.id;
                rights.hasEditRights = rights.hasEditRights || localDoc.editor === user.id;
                rights.hasDeleteRights = rights.hasDeleteRights || localDoc.creator === user.id;
                return rights;
              }),
              catchError(() => (of(rights)))
            );
          })
        );
      })
    );
  }

  getRightsToLocalDocument(doc?: Document): Observable<DocumentRights> {
    return this.userService.user$.pipe(
      switchMap(user => {
        if (!user?.id || !doc) {
          return of({ isEditor: false, hasEditRights: false, hasDeleteRights: false });
        }

        const isFormAdmin$ = this.userIsFormAdmin(user, doc.collectionID, this.userService.getToken());

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

  private userIsFormAdmin(user: Person, collectionId?: string, personToken?: string): Observable<boolean> {
    if (!collectionId) {
      return of(false);
    }

    return this.formPermissionService.getFormPermission(collectionId, personToken).pipe(
      map(formPermission => this.formPermissionService.isAdmin(formPermission, user))
    );
  }
}
