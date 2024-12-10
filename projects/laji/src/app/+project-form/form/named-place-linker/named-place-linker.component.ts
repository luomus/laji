import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit } from '@angular/core';
import { FormService } from '../../../shared/service/form.service';
import { Form } from '../../../shared/model/Form';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { combineLatest, EMPTY, Observable, of, Subscription } from 'rxjs';
import { Document } from '../../../shared/model/Document';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '../../../shared/service/dialog.service';
import { DocumentApi } from '../../../shared/api/DocumentApi';
import { UserService } from '../../../shared/service/user.service';
import { ToastsService } from '../../../shared/service/toasts.service';
import { FormPermissionService } from '../../../shared/service/form-permission.service';
import { DocumentService, Readonly } from '../../../shared-modules/own-submissions/service/document.service';

interface ViewModel {
  document: Document;
  form: Form.SchemaForm;
  isLinkable: boolean;
  isLinked: boolean;
}

@Component({
  selector: 'laji-named-place-linker',
  templateUrl: './named-place-linker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NamedPlaceLinkerComponent implements OnInit, OnDestroy {
  @Input() documentID!: string;

  reloadSubmissions$ = new EventEmitter<void>();

  document$!: Observable<Document>;
  vm$!: Observable<ViewModel>;
  loading = false;
  _linked = false;

  municipality!: string;
  birdAssociationArea!: string;
  tags!: string[];
  activeNP!: string;

  subscription!: Subscription;

  constructor(
    private formService: FormService,
    private translate: TranslateService,
    private dialogService: DialogService,
    private documentApi: DocumentApi,
    private userService: UserService,
    private toastsService: ToastsService,
    private formPermissionService: FormPermissionService,
    private documentService: DocumentService
  ) { }

  ngOnInit(): void {
    this.document$ = this.documentService.findById(this.documentID);

    const form$ = this.document$.pipe(switchMap(document => this.formService.getForm(document.formID)));
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const rights$ = form$.pipe(switchMap(form => this.formPermissionService.getRights(form!)));
    const documentReadOnly$ = combineLatest(this.document$, rights$, this.userService.user$).pipe(
      map(([document, rights, person]) => this.documentService.getReadOnly(document, rights, person)),
      map(readonly => readonly === Readonly.true || readonly === Readonly.noEdit)
    );
    const isLinked$ = this.document$.pipe(map(document => !!document?.namedPlaceID));

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.vm$ = combineLatest([this.document$, form$, documentReadOnly$, isLinked$]).pipe(
      map(([document, form, isReadonly, isLinked]) => ({document, form, isLinkable: !isReadonly, isLinked}))
    ) as Observable<ViewModel>;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }


  onBirdAssociationAreaChange(birdAssociationArea: string) {
    this.birdAssociationArea = birdAssociationArea;
  }

  onMunicipalityChange(municipality: string) {
    this.municipality = municipality;
  }

  onTagsChange(tags: string[]) {
    this.tags = tags;
  }

  onActiveIdChange(id: string) {
    this.activeNP = id;
  }

  use(id: string) {
    this.loading = true;
    this.subscription = this.translate.get(['np.linker.confirm', 'np.linker.doLink']).pipe(
      take(1),
      switchMap(translations => this.dialogService.confirm(translations['np.linker.confirm'], translations['np.linker.doLink'])),
      switchMap(confirmed => {
        if (!confirmed) {
          this.loading = false;
          return EMPTY;
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.document$.pipe(switchMap((doc) => this.documentApi.update(doc.id!, {...doc, namedPlaceID: id}, this.userService.getToken())));
      }),
      switchMap(document => this.formService.getForm(document.formID).pipe(map(form => ({form, document})))),
      catchError(() => {
        this.translate.get('np.linker.fail').pipe(take(1)).subscribe(msg => this.toastsService.showError(msg));
        this.loading = false;
        return of(null);
      })
    ).subscribe((res: null | {document: Document; form: Form.SchemaForm | undefined}) => {
      if (!res) {
        this.loading = false;
        return;
      }
      this._linked = true;
      this.loading = false;
      this.translate.get('np.linker.success').pipe(take(1)).subscribe(msg => this.toastsService.showSuccess(msg));
      this.reloadSubmissions$.next();
    });
  }
}
