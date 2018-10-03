import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin as ObservableForkJoin, merge as ObservableMerge, Observable, of as ObservableOf, Subscription } from 'rxjs';
import { Form } from '../../shared/model/Form';
import { Logger } from '../../shared/logger/logger.service';
import { FormService } from '../../shared/service/form.service';
import { UserService } from '../../shared/service/user.service';
import { FormPermissionService } from '../form-permission/form-permission.service';
import { Person } from '../../shared/model/Person';
import { environment } from '../../../environments/environment';
import { map, switchMap } from 'rxjs/operators';
import { TriplestoreLabelService } from '../../shared/service/triplestore-label.service';

const DEFAULT_CATEGORY = 'MHL.categoryGeneric';

export interface FormList extends Form.List {
  hasAdminRight: boolean;
}

interface FormCategory {
  forms: FormList[],
  category: string;
  label: string;
}

@Component({
  selector: 'laji-haseka-form-list',
  templateUrl: './haseka-form-list.component.html',
  styleUrls: ['./haseka-form-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HaSeKaFormListComponent implements OnInit, OnDestroy {
  public surveyCategory = ['MHL.categorySurvey', 'MHL.categoryBirdMonitoringSchemes'];
  public categories: FormCategory[] = [];
  public tmpDocument: { [formId: string]: string } = {};
  private subTrans: Subscription;
  private subFetch: Subscription;
  private subTmp: Subscription;
  private person: Person;
  private loadedLang: string;
  private categoryLabels: {[key: string]: string} = {};

  constructor(private formService: FormService,
              private translate: TranslateService,
              private logger: Logger,
              private userService: UserService,
              private formPermissionService: FormPermissionService,
              private triplestoreLabelService: TriplestoreLabelService,
              private changeDetector: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.subTmp = ObservableMerge(
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
    this.subFetch = this.formService.getAllForms(this.loadedLang).pipe(
      switchMap(forms => this.triplestoreLabelService.getAll([...forms.map(form => form.category)], lang).pipe(
        map(labels => {
          this.categoryLabels = labels;
          return forms;
        })
      ))
    ).subscribe(
        forms => {
          this.updateCategories(forms);
          this.updateAdminRigths();
        },
        err => this.logger.log('Failed to fetch all forms', err)
      );
  }

  updateAdminRigths() {
    if (!this.categories) {
      return;
    }
    const formsSub = [];
    this.categories.forEach(category => {
      category.forms.forEach(form => {
        formsSub.push(this.hasAdminRight(form).pipe(map(hasAdminRight => ({...form, hasAdminRight: hasAdminRight}))));
      })
    });
    ObservableForkJoin(formsSub).subscribe(forms => this.updateCategories(forms));
  }

  hasAdminRight(form: Form.List): Observable<boolean> {
    if (!form.collectionID || !form.features ||
      (form.features.indexOf(Form.Feature.Restricted) === -1 && form.features.indexOf(Form.Feature.Administer) === -1)
    ) {
      return ObservableOf(false);
    }
    return this.userService.isLoggedIn$
      .take(1)
      .switchMap(loggedIn => loggedIn ?
        this.formPermissionService.getFormPermission(form.collectionID, this.userService.getToken())
          .combineLatest(
            this.person ? ObservableOf(this.person) : this.userService.getUser(),
            (permission, person) => ({permission, person})
          )
          .map(data => this.formPermissionService.isAdmin(data.permission, data.person)) :
        ObservableOf(false));
  }

  trackCategory(idx, category) {
    return category ? category.category : undefined;
  }

  private updateCategories(forms) {
    const categories: FormCategory[] = [];
    const idxRef = {};
    let idx = 0;
    forms.sort((a, b) => environment.formWhitelist.indexOf(a.id) - environment.formWhitelist.indexOf(b.id));
    forms.forEach((form: FormList) => {
      const category = form.category || DEFAULT_CATEGORY;
      if (typeof idxRef[category] === 'undefined') {
        categories.push({
          category: category,
          label: this.categoryLabels[category],
          forms: []
        });
        idxRef[category] = idx;
        idx++;
      }
      categories[idxRef[category]].forms.push(form);
    });
    this.categories = categories;
    this.changeDetector.markForCheck();
  }

}
