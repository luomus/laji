import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Form, FormListInterface } from '../../shared/model/FormListInterface';
import { Logger } from '../../shared/logger/logger.service';
import { FormService } from '../../shared/service/form.service';
import { UserService } from '../../shared/service/user.service';
import { FormPermissionService } from '../form-permission/form-permission.service';
import { Person } from '../../shared/model/Person';

@Component({
  selector: 'laji-haseka-form-list',
  templateUrl: './haseka-form-list.component.html',
  styleUrls: ['./haseka-form-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HaSeKaFormListComponent implements OnInit, OnDestroy {
  public formList: FormListInterface[] = [];
  public tmpDocument: { [formId: string]: string } = {};
  private subTrans: Subscription;
  private subFetch: Subscription;
  private subTmp: Subscription;
  private person: Person;


  constructor(private formService: FormService,
              private translate: TranslateService,
              private logger: Logger,
              private router: Router,
              private userService: UserService,
              private formPermissionService: FormPermissionService,
              private changeDetector: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.subTmp = Observable.merge(
      this.formService.getAllTempDocuments(),
      this.formService.localChanged
        .switchMap(() => this.formService.getAllTempDocuments())
    ).map(documents => documents.reduce(
      (cumulative, current) => {
        if (current.formID && !cumulative[current.formID]) {
          cumulative[current.formID] = current.id;
        }
        return cumulative;
      }, {})
    ).subscribe((data: any) => {
      this.tmpDocument = data;
      this.changeDetector.markForCheck();
    });
    this.subTrans = this.translate.onLangChange.subscribe(
      () => {
        this.updateForms();
      }
    );
    this.updateForms();
  }

  ngOnDestroy() {
    if (this.subTrans) {
      this.subTrans.unsubscribe();
    }
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    if (this.subTmp) {
      this.subTmp.unsubscribe();
    }
  }

  updateForms() {
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    this.subFetch = this.formService.getAllForms(this.translate.currentLang)
      .subscribe(
        forms => {
          this.formList = forms;
          this.changeDetector.markForCheck();
        },
        err => this.logger.log('Failed to fetch all forms', err)
      );
  }

  goToForm(form: FormListInterface) {
    if (form.collectionID && form.features && form.features.indexOf(Form.Feature.Restricted) > -1) {
      Observable.forkJoin(
        this.userService.isLoggedIn ?
          this.formPermissionService.getFormPermission(form.collectionID, this.userService.getToken()) :
          Observable.of({}),
        this.userService.getUser(),
        (permission, user) => ({permission: permission, user: user})
      )
        .subscribe(data => {
          if (this.formPermissionService.isEditAllowed(data.permission, data.user)) {
            this._goToForm(form);
            return;
          }
          this.router.navigate(['/vihko/fp/' + form.collectionID]);
        });
      return;
    }
    this._goToForm(form);
  }

  hasAdminRight(form: FormListInterface) {
    if (!this.userService.isLoggedIn || !form.collectionID || !form.features || form.features.indexOf(Form.Feature.Restricted) === -1) {
      return Observable.of(false);
    }
    return this.formPermissionService.getFormPermission(form.collectionID, this.userService.getToken())
      .combineLatest(
        this.person ? Observable.of(this.person) : this.userService.getUser(),
        (permission, person) => ({permission, person})
      )
      .map(data => this.formPermissionService.isAdmin(data.permission, data.person));
  }

  trackForm(idx, form) {
    return form ? form.id : undefined;
  }

  private _goToForm(form: FormListInterface) {
    if (form.features.indexOf(Form.Feature.NamedPlace) > -1) {
      this.router.navigate(['/vihko/np/' + form.collectionID + '/' + form.id]);
    } else {
      this.router.navigate(['/vihko/' + form.id]);
    }
  }

}
