import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Form } from '../../shared/model/Form';
import { Observable } from 'rxjs';
import { ProjectFormService, RegistrationContact } from '../../shared/service/project-form.service';
import { UserService } from '../../shared/service/user.service';
import { FormPermissionService } from '../../shared/service/form-permission.service';
import { ActivatedRoute } from '@angular/router';
import { map, mergeMap } from 'rxjs/operators';
import { Rights } from '../about/about.component';

interface ThankYouData {
  loggedIn: boolean;
  rights: Rights;
  form: Form.SchemaForm;
}

@Component({
  selector: 'laji-thank-you',
  templateUrl: './thank-you.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThankYouComponent implements OnInit, OnDestroy {

  thankYouData$!: Observable<ThankYouData>;
  registrationContacts?: RegistrationContact[] | undefined;

  constructor(private userService: UserService,
                private formPermissionService: FormPermissionService,
                private projectFormService: ProjectFormService,
                private route: ActivatedRoute
                ) {}

  ngOnInit() {
    this.thankYouData$ = this.userService.isLoggedIn$.pipe(
      mergeMap(loggedIn => this.projectFormService.getFormFromRoute$(this.route).pipe(
        mergeMap(form => {
          if (form.options?.openForm ?? false) {
            const contacts = this.projectFormService.getRegistrationContacts();
            this.registrationContacts = contacts;
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

  register() {
    this.userService.register(this.registrationContacts);
  }
}
