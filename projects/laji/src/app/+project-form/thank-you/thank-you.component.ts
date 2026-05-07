import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ProjectFormService, RegistrationContact } from '../../shared/service/project-form.service';
import { UserService } from '../../shared/service/user.service';
import { FormPermissionService } from '../../shared/service/form-permission.service';
import { ActivatedRoute } from '@angular/router';
import { map, mergeMap } from 'rxjs';
import { Rights } from '../about/about.component';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Form = components['schemas']['Form'];

interface ThankYouData {
  loggedIn: boolean;
  rights: Rights;
  form: Form;
}

@Component({
    selector: 'laji-thank-you',
    templateUrl: './thank-you.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ThankYouComponent implements OnInit, OnDestroy {

  thankYouData$!: Observable<ThankYouData | undefined>;
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
          if (form?.options?.openForm ?? false) {
            const contacts = this.projectFormService.getRegistrationContacts();
            this.registrationContacts = contacts;
          }
          if (!form) {
            return of(undefined);
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
