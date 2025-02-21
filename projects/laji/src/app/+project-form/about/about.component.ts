import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '../../shared/service/user.service';
import { map, mergeMap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Form } from '../../shared/model/Form';
import { ProjectFormService, RegistrationContact } from '../../shared/service/project-form.service';
import { FormPermissionService } from '../../shared/service/form-permission.service';
import { Document } from '../../shared/model/Document';
import { DocumentViewerFacade } from '../../shared-modules/document-viewer/document-viewer.facade';

export enum Rights {
  Allowed,
  NotAllowed
}

interface AboutData {
  loggedIn: boolean;
  rights: Rights;
  form: Form.SchemaForm;
}

@Component({
  selector: 'laji-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit, OnDestroy {

  Rights = Rights; // eslint-disable-line @typescript-eslint/naming-convention
  aboutData$!: Observable<AboutData>;
  registrationContacts?: RegistrationContact[] | undefined;

  constructor(private userService: UserService,
              private formPermissionService: FormPermissionService,
              private projectFormService: ProjectFormService,
              private route: ActivatedRoute,
              private documentViewerFacade: DocumentViewerFacade,
              private router: Router
              ) {}

  ngOnInit() {
    this.aboutData$ = this.userService.isLoggedIn$.pipe(
      mergeMap(loggedIn => this.projectFormService.getFormFromRoute$(this.route).pipe(
        mergeMap(form => {
          if (form.options?.openForm) {
            const contacts = this.projectFormService.getRegistrationContacts();
            this.registrationContacts = contacts;
            console.log('contacts', contacts);
          }
          return this.formPermissionService.getRights(form).pipe(
            map((rights) => ({
              loggedIn,
              rights: rights.edit === true ? Rights.Allowed : Rights.NotAllowed,
              form
            }))
          );
        })
      ))
    );
  }

  ngOnDestroy() {
    if (this.projectFormService.getRegistrationContacts()) {
      this.projectFormService.setRegistrationContacts(undefined);
    }
  }

  showDocumentViewer(document: Document) {
    this.documentViewerFacade.showDocument({document, own: true});
  }

  enterForm() {
     this.router.navigate(['..', 'form'], {relativeTo: this.route});
  }

  login() {
    this.userService.redirectToLogin();
  }

  register() {
    this.userService.register(this.registrationContacts);
  }
}
