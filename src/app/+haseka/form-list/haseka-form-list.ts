import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Form } from '../../shared/model/Form';
import { Logger } from '../../shared/logger/logger.service';
import { FormService } from '../../shared/service/form.service';
import { UserService } from '../../shared/service/user.service';
import { FormPermissionService } from '../form-permission/form-permission.service';
import { Person } from '../../shared/model/Person';

interface FormList extends Form.List {
  hasAdminRight: boolean;
}

@Component({
  selector: 'laji-haseka-form-list',
  templateUrl: './haseka-form-list.component.html',
  styleUrls: ['./haseka-form-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HaSeKaFormListComponent implements OnInit, OnDestroy {
  public formList: FormList[] = [];
  public tmpDocument: { [formId: string]: string } = {};
  private subTrans: Subscription;
  private subFetch: Subscription;
  private subTmp: Subscription;
  private person: Person;
  private loadedLang: string;

  constructor(private formService: FormService,
              private translate: TranslateService,
              private logger: Logger,
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
    const lang = this.translate.currentLang;
    if (this.subFetch) {
      if (this.loadedLang === lang) {
        return;
      }
      this.subFetch.unsubscribe();
    }
    this.loadedLang = lang;
    this.subFetch = this.formService.getAllForms(this.loadedLang)
      .switchMap((forms) => {
        if (forms.length === 0) {
          return Observable.of(forms);
        }
        const subs = [];
        forms.map(form => {
          subs.push(
            this.hasAdminRight(form)
              .map(hasAdminRight => ({...form, hasAdminRight: hasAdminRight}))
          )
        });
        return Observable.forkJoin(subs);
      })
      .subscribe(
        forms => {
          forms.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
          this.formList = forms;
          this.changeDetector.markForCheck();
        },
        err => this.logger.log('Failed to fetch all forms', err)
      );
  }

  hasAdminRight(form: Form.List): Observable<boolean> {
    if (!this.userService.isLoggedIn || !form.collectionID || !form.features ||
      (form.features.indexOf(Form.Feature.Restricted) === -1 && form.features.indexOf(Form.Feature.Administer) === -1)
    ) {
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

}
