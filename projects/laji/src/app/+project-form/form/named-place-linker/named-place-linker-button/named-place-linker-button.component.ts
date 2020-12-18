import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { map, switchMap } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { LajiFormDocumentFacade, Readonly } from '@laji-form/laji-form-document.facade';
import { FormService } from '../../../../shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '../../../../shared/service/dialog.service';
import { DocumentApi } from '../../../../shared/api/DocumentApi';
import { UserService } from '../../../../shared/service/user.service';
import { ToastsService } from '../../../../shared/service/toasts.service';
import { FormPermissionService } from '../../../../shared/service/form-permission.service';

interface ViewModel {
  documentID: string;
  formID: string;
  isLinkable: boolean;
}

@Component({
  selector: 'laji-named-place-linker-button',
  template: `
    <ng-container *ngIf="vm$ | async as vm">
      <alert type="warning" *ngIf="vm.isLinkable">
        Puuttuu nimetty paikka<br>
        <lu-button [anchor]="['/project', vm.formID, 'form', vm.documentID, 'link']" id="link-to-np">Linkitä havaintoerä nimettyyn paikkaan</lu-button>
      </alert>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NamedPlaceLinkerButtonComponent implements OnInit {

  @Input() documentID: string;

  vm$: Observable<ViewModel>;

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

  ngOnInit() {
    const document$ = this.documentApi.findById(this.documentID, this.userService.getToken());
    const form$ = document$.pipe(
      switchMap(document => this.formService.getAllForms().pipe(
        map(forms => forms.find(f => f.id === document.formID))
      ))
    );
    const rights$ = form$.pipe(switchMap(form => this.formPermissionService.getRights(form)));
    const documentReadOnly$ = combineLatest(document$, rights$, this.userService.user$).pipe(
      map(([document, rights, person]) => this.lajiFormDocumentFacade.getReadOnly(document, rights, person)),
      map(readonly => readonly === Readonly.true || readonly === Readonly.noEdit)
    );
    const isLinkable$ = combineLatest(document$, form$, documentReadOnly$).pipe(
      map(([document, form, readonly]) => !readonly && form.options?.useNamedPlaces && !document?.namedPlaceID)
    );

    this.vm$ = combineLatest(isLinkable$, form$, document$).pipe(
      map(([isLinkable, form, document]) => ({isLinkable, formID: form.id, documentID: document.id})
    ));
  }
}
