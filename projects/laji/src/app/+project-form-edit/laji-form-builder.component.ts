import LajiFormBuilder from 'laji-form-builder';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, NgZone, OnDestroy, ViewChild } from '@angular/core';
import lajiFormBuilderBs3Theme from 'laji-form-builder/lib/themes/bs3';
import { FormApiClient } from '../shared/api/FormApiClient';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../shared/service/user.service';
import { Form } from '../shared/model/Form';
import SchemaForm = Form.SchemaForm;
import { ToastsService } from '../shared/service/toasts.service';
import { ProjectFormService } from '../shared/service/project-form.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { Global } from '../../environments/global';
import { Lang } from 'laji-form-builder/lib/model';

@Component({
  selector: 'laji-form-builder',
  template: `<div #lajiFormBuilder></div>`,
  styleUrls: ['./laji-form-builder.component.scss'],
  providers: [FormApiClient],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LajiFormBuilderComponent implements AfterViewInit, OnDestroy {
  @Input() id: string;

  @ViewChild('lajiFormBuilder', { static: true }) lajiFormBuilderRoot: ElementRef;

  private lajiFormBuilder: LajiFormBuilder;

  constructor(
    private ngZone: NgZone,
    private apiClient: FormApiClient,
    private translate: TranslateService,
    private userService: UserService,
    private toastsService:  ToastsService,
    private projectFormService: ProjectFormService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.onChange = this.onChange.bind(this);
  }

  ngAfterViewInit() {
    this.mount();
  }

  ngOnDestroy() {
    this.unmount();
  }

  private mount() {
    this.apiClient.lang = this.translate.currentLang;
    this.apiClient.personToken = this.userService.getToken();
    this.ngZone.runOutsideAngular(() => {
      this.lajiFormBuilder = new LajiFormBuilder({
        id: this.id,
        rootElem: this.lajiFormBuilderRoot.nativeElement,
        theme: lajiFormBuilderBs3Theme,
        apiClient: this.apiClient,
        lang: this.translate.currentLang as Lang,
        onLangChange: this.onLangChange,
        primaryDataBankFormID: Global.forms.databankPrimary,
        secondaryDataBankFormID: Global.forms.databankSecondary,
        onChange: this.onChange,
        notifier: {
          success: msg => this.toastsService.showSuccess(msg),
          info: msg => this.toastsService.showInfo(msg),
          warning: msg => this.toastsService.showWarning(msg),
          error: msg => this.toastsService.showError(msg),
        },
      });
    });
  }

  private unmount() {
    this.lajiFormBuilder.destroy();
  }

  onChange(form: SchemaForm) {
    const id = form.id ? form.id : 'tmp';
    if (id !== this.id) {
      of(this.router.navigate(['./' + id], {replaceUrl: true, relativeTo: this.route})).subscribe(() => {
        this.projectFormService.updateLocalForm({...form, id});
      });
    } else {
      this.projectFormService.updateLocalForm(form);
    }
  }

  onLangChange(lang: Lang) {
    console.warn('TODO lang change');
  }
}
