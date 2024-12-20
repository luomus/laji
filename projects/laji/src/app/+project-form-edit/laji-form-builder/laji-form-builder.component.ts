import type LajiFormBuilder from '@luomus/laji-form-builder';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, NgZone, OnDestroy, ViewChild } from '@angular/core';
import lajiFormBuilderBs3Theme from '@luomus/laji-form-builder/lib/client/themes/bs3';
import { FormApiClient } from '../../shared/api/FormApiClient';
import { TranslateService } from '@ngx-translate/core';
import { Form } from '../../shared/model/Form';
import SchemaForm = Form.SchemaForm;
import { ToastsService } from '../../shared/service/toasts.service';
import { ProjectFormService } from '../../shared/service/project-form.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription, from, of } from 'rxjs';
import { Global } from '../../../environments/global';
import { Lang } from '@luomus/laji-form-builder/lib/model';
import { UserService } from '../../shared/service/user.service';
import { map, shareReplay, tap } from 'rxjs/operators';
import { environment } from 'projects/laji/src/environments/environment';

@Component({
  selector: 'laji-form-builder',
  template: `<div #lajiFormBuilder></div>`,
  styleUrls: ['./laji-form-builder.component.scss'],
  providers: [FormApiClient],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LajiFormBuilderComponent implements AfterViewInit, OnDestroy {
  @Input() id?: string;

  @ViewChild('lajiFormBuilder', { static: true }) lajiFormBuilderRoot!: ElementRef;

  private lajiFormBuilder!: LajiFormBuilder;

  constructor(
    private ngZone: NgZone,
    private apiClient: FormApiClient,
    private translate: TranslateService,
    private toastsService:  ToastsService,
    private projectFormService: ProjectFormService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService
  ) {
  }

  ngAfterViewInit() {
    this.mount();
  }

  ngOnDestroy() {
    this.unmount();
    this.lajiFormBuilderUpdateSub?.unsubscribe();
  }

  lajiFormBuilderImport = from(import('@luomus/laji-form-builder')).pipe( map(p => (p as any).default), shareReplay()) as Observable<any>;

  private mount() {
    this.ngZone.runOutsideAngular(() => {
      this.apiClient.lang = this.translate.currentLang;
      this.apiClient.personToken = this.userService.getToken();
      this.updateLajiFormBuilder();
    });
  }

  lajiFormBuilderUpdateSub!: Subscription;

  updateLajiFormBuilder() {
    this.lajiFormBuilderUpdateSub?.unsubscribe();
    // eslint-disable-next-line @typescript-eslint/naming-convention
    this.lajiFormBuilderUpdateSub = this.lajiFormBuilderImport.subscribe((LajiFormBuilder) =>  {
      this.lajiFormBuilder = new LajiFormBuilder({
        id: this.id,
        rootElem: this.lajiFormBuilderRoot.nativeElement,
        theme: lajiFormBuilderBs3Theme,
        apiClient: this.apiClient,
        lang: this.translate.currentLang as Lang,
        onLangChange: this.onLangChange.bind(this),
        primaryDataBankFormID: Global.forms.databankPrimary,
        secondaryDataBankFormID: Global.forms.databankSecondary,
        onChange: this.onChange.bind(this),
        onRemountLajiForm: this.onRemountLajiForm.bind(this),
        onSelected: this.onSelected.bind(this),
        idToUri: this.idToUri.bind(this),
        notifier: {
          success: (msg: any) => this.ngZone.run(() => this.toastsService.showSuccess(msg)),
          info: (msg: any) => this.ngZone.run(() => this.toastsService.showInfo(msg)),
          warning: (msg: any) => this.ngZone.run(() => this.toastsService.showWarning(msg)),
          error: (msg: any) => this.ngZone.run(() => this.toastsService.showError(msg)),
        }
      });
    });
  }

  private unmount() {
    this.ngZone.runOutsideAngular(() => {
      this.lajiFormBuilder.destroy();
    });
  }

  onChange(form: SchemaForm) {
    this.ngZone.run(() => {
      const id = form.id ? form.id : 'tmp';
      if (id !== this.id) {
        this.id = id;
        of(this.router.navigate(['./' + id], {replaceUrl: true, relativeTo: this.route})).subscribe(() => {
          this.projectFormService.updateLocalForm({...form, id});
        });
      } else {
        this.projectFormService.updateLocalForm(form);
      }
    });
  }

  onLangChange(lang: Lang) {
    this.projectFormService.updateLocalLang(lang);
  }

  onRemountLajiForm() {
    this.projectFormService.remountLajiForm();
  }

  onSelected(id: string) {
    this.id = id;
    of(this.router.navigate(['./' + id], {replaceUrl: true, relativeTo: this.route})).subscribe(() => {
      this.updateLajiFormBuilder();
    });
  }

  idToUri(id: string) {
    return `${environment.base}/project-edit/${id}`;
  }
}
