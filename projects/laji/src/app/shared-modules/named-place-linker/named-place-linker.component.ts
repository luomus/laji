import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormService } from '../../shared/service/form.service';
import { Form } from '../../shared/model/Form';
import { catchError, map, mergeMap, switchMap, take } from 'rxjs/operators';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { Document } from '../../shared/model/Document';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '../../shared/service/dialog.service';
import { ISuccessEvent, LajiFormDocumentFacade, Readonly } from '../laji-form/laji-form-document.facade';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { UserService } from '../../shared/service/user.service';
import { ToastsService } from '../../shared/service/toasts.service';
import { FormPermissionService } from '../../shared/service/form-permission.service';

interface ViewModel {
  document: Document;
  form: Form.SchemaForm;
}

@Component({
  selector: 'laji-named-place-linker',
  templateUrl: './named-place-linker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NamedPlaceLinkerComponent implements OnInit, OnDestroy {
  @Input() documentID: string;

  @Output() linked = new EventEmitter<ISuccessEvent>();

  document$: Observable<Document>;
  isLinkable$: Observable<boolean>;
  vm$: Observable<ViewModel>;
  loading = false;

  municipality: string;
  birdAssociationArea: string;
  tags: string[];
  activeNP: string;

  subscription: Subscription;

  @ViewChild('modal', {static: true}) public modal: ModalDirective;

  constructor(
    private formService: FormService,
    private translate: TranslateService,
    private dialogService: DialogService,
    private lajiFormDocumentFacade: LajiFormDocumentFacade,
    private documentApi: DocumentApi,
    private userService: UserService,
    private toastsService: ToastsService,
    private formPermissionService: FormPermissionService,
  ) { }

  ngOnInit(): void {
    this.document$ = this.documentApi.findById(this.documentID, this.userService.getToken());
    const form$ = this.document$.pipe(
      switchMap(document => this.formService.getAllForms().pipe(
        map(forms => forms.find(f => f.id === document.formID))
      ))
    );
    const rights$ = form$.pipe(switchMap(form => this.formPermissionService.getRights(form)));
    const documentReadOnly$ = combineLatest(this.document$, rights$, this.userService.user$).pipe(
      map(([document, rights, person]) => this.lajiFormDocumentFacade.getReadOnly(document, rights, person)),
      map(readonly => readonly === Readonly.true || readonly === Readonly.noEdit)
    );
    this.isLinkable$ = combineLatest(this.document$, form$, documentReadOnly$).pipe(
      map(([document, form, readonly]) => !readonly && form.options?.useNamedPlaces && !document?.namedPlaceID)
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  openNamedPlacesChooserModal() {
    const form$ = this.document$.pipe(switchMap(document => this.formService.getForm(document.formID)));
    if (!this.vm$) {
      this.vm$ = combineLatest(this.document$, form$).pipe(map(([document, form]) => ({document, form})));
    }
    this.modal?.show();
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
    this.subscription = this.translate.get('np.linker.confirm').pipe(
      take(1),
      switchMap(txt => this.dialogService.confirm(txt)),
      switchMap(confirmed => {
        if (!confirmed) {
          return;
        }
        return this.document$.pipe(switchMap((doc) => {
          return this.documentApi.update(doc.id, {...doc, namedPlaceID: id}, this.userService.getToken());
        }));
      }),
      switchMap(document => this.formService.getForm(document.formID).pipe(map(form => ({form, document})))),
      catchError(() => {
        this.translate.get('np.linker.fail').pipe(take(1)).subscribe(msg => this.toastsService.showError(msg));
        this.loading = false;
        return null;
      })
    ).subscribe((res: null | {document: Document, form: Form.SchemaForm}) => {
      if (!res) {
        return;
      }
      this.modal.hide();
      this.translate.get('np.linker.success').pipe(take(1)).subscribe(msg => this.toastsService.showSuccess(msg));
      this.linked.emit({success: true, ...res});
      this.loading = false;
    });
  }
}
