import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../shared/service/user.service';
import { FormService } from '../../../shared/service/form.service';
import { FormPermissionService } from '../../../+haseka/form-permission/form-permission.service';
import { TranslateService } from '@ngx-translate/core';
import { map, mergeMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { ThemeFormService } from '../theme-form.service';
import { Observable } from 'rxjs';

export enum Rights {
  Allowed,
  NotAllowed
}

interface InstructionsData {
  loggedIn: boolean;
  rights: Rights;
  instructions: string;
  collectionID: string;
  disableRequestDescription: boolean;
}

@Component({
  selector: 'laji-instructions',
  templateUrl: './instructions.component.html',
  styleUrls: ['./instructions.component.scss']
})
export class InstructionsComponent implements OnInit {

  Rights = Rights;

  instructionsData$: Observable<InstructionsData>;

  constructor(private userService: UserService,
              private formService: FormService,
              private formPermissionService: FormPermissionService,
              private translateService: TranslateService,
              private themeFormService: ThemeFormService,
              private route: ActivatedRoute) {}

  ngOnInit() {
    this.instructionsData$ = this.userService.isLoggedIn$.pipe(
        mergeMap(loggedIn => this.themeFormService.getForm(this.route).pipe(
          mergeMap(form => this.formPermissionService.getRights(form).pipe(
            mergeMap(rights => this.route.parent.data.pipe(
              map(({instructions, hasRightsInstructions}) => ({
                loggedIn,
                rights: rights.edit === true ? Rights.Allowed : Rights.NotAllowed,
                collectionID: form.collectionID,
                instructions: rights.edit && hasRightsInstructions
                  ? hasRightsInstructions
                  : instructions,
                disableRequestDescription: form.options && form.options.disableRequestDescription
              }))
          ))
      ))
    ))
    );
  }
}
