import { combineLatest, map, switchMap, take } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin as ObservableForkJoin, Observable, of as ObservableOf, Subscription } from 'rxjs';
import { Form } from '../../shared/model/Form';
import { Logger } from '../../shared/logger/logger.service';
import { FormService } from '../../shared/service/form.service';
import { UserService } from '../../shared/service/user.service';
import { FormPermissionService } from '../../shared/service/form-permission.service';
import { Person } from '../../shared/model/Person';
import { TriplestoreLabelService } from '../../shared/service/triplestore-label.service';
import { LatestDocumentsFacade } from '../../shared-modules/latest-documents/latest-documents.facade';
import { FormCategory } from './haseka-form-list.interface';


const DEFAULT_CATEGORY = 'MHL.categoryGeneric';

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
              private latestFacade: LatestDocumentsFacade,
              private changeDetector: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.subTmp = this.latestFacade.tmpDocuments$.pipe(
      map(res => res.map(r => r.document)),
      map(documents => documents.reduce((cumulative, current) => {
          if (!cumulative[current.formID]) {
            cumulative[current.formID] = current.id;
          }
          return cumulative;
        }, {})
      )
    ).subscribe((data: any) => {
      this.tmpDocument = data;
      this.changeDetector.markForCheck();
    });
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
        },
        err => this.logger.log('Failed to fetch all forms', err)
      );
  }

  trackCategory(idx, category) {
    return category ? category.category : undefined;
  }

  private updateCategories(forms) {
    const categories: FormCategory[] = [];
    const idxRef = {};
    let idx = 0;
    forms.forEach((form: Form.List) => {
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
