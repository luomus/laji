import { ChangeDetectionStrategy, Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import { combineLatest, EMPTY, Observable, of } from 'rxjs';
import { FormService } from '../../../../shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '../../../../shared/service/dialog.service';
import { DocumentApi } from '../../../../shared/api/DocumentApi';
import { UserService } from '../../../../shared/service/user.service';
import { ToastsService } from '../../../../shared/service/toasts.service';
import { FormPermissionService } from '../../../../shared/service/form-permission.service';
import { DocumentService, Readonly } from '../../../../shared-modules/own-submissions/service/document.service';

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
        {{ 'np.linker.npMissing' | translate }} <br>
        <lu-button [anchor]="['/project', vm.formID, 'form', vm.documentID, 'link'] | localize" id="link-to-np" (click)="this.click.emit($event)">{{ 'np.linker.start' | translate }}</lu-button>
      </alert>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NamedPlaceLinkerButtonComponent implements OnInit {

  @Input() documentID: string;

  @Output() click = new EventEmitter();

  vm$: Observable<ViewModel>;

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

  ngOnInit() {
    const document$ = this.userService.isLoggedIn$.pipe(
      switchMap(isLoggedIn => isLoggedIn
        ? this.documentApi.findById(this.documentID, this.userService.getToken()).pipe(
          catchError(() => EMPTY)
        )
        : EMPTY),
      shareReplay(1)
    );
    const form$ = document$.pipe(
      switchMap(document => this.formService.getAllForms().pipe(
        map(forms => forms.find(f => f.id === document.formID))
      ))
    );
    const rights$ = form$.pipe(switchMap(form => this.formPermissionService.getRights(form)));
    const documentReadOnly$ = combineLatest(document$, rights$, this.userService.user$).pipe(
      map(([document, rights, person]) => this.documentService.getReadOnly(document, rights, person)),
      map(readonly => readonly === Readonly.true || readonly === Readonly.noEdit)
    );
    const isLinkable$ = form$.pipe(switchMap(form =>
      form.options?.useNamedPlaces
        ? combineLatest(document$, documentReadOnly$).pipe(
          map(([document, readonly]) => !readonly && !document.namedPlaceID)
        )
        : of(false)
    ));

    this.vm$ = combineLatest(isLinkable$, form$).pipe(
      map(([isLinkable, form]) => ({isLinkable, formID: form.id, documentID: this.documentID})
    ));
  }
}
