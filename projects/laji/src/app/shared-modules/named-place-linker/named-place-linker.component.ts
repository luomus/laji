import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormService } from '../../shared/service/form.service';
import { Form } from '../../shared/model/Form';
import { map, switchMap, take } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { Document } from '../../shared/model/Document';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '../../shared/service/dialog.service';
import { LajiFormDocumentFacade, Readonly } from '../laji-form/laji-form-document.facade';

interface ViewModel {
  document: Document;
  form: Form.SchemaForm;
}

@Component({
  selector: 'laji-named-place-linker',
  templateUrl: './named-place-linker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NamedPlaceLinkerComponent implements OnInit {
  @Input() document: Document;

  isLinkable$: Observable<boolean>;
  vm$: Observable<ViewModel>;

  municipality: string;
  birdAssociationArea: string;
  tags: string[];
  activeNP: string;

  @ViewChild('modal', {static: true}) public modal: ModalDirective;

  constructor(
    private formService: FormService,
    private translate: TranslateService,
    private dialogService: DialogService,
    private lajiFormDocumentFacade: LajiFormDocumentFacade
  ) { }

  ngOnInit(): void {
    const form$ = this.formService.getAllForms().pipe(map(forms => forms.find(f => f.id === this.document.formID)));
    const documentReadOnly$ = this.lajiFormDocumentFacade.vm$.pipe(map(vm => vm.form.readonly === Readonly.noEdit || vm.form.readonly === Readonly.true));
    documentReadOnly$.subscribe(r => console.log('R', r));
    this.isLinkable$ = combineLatest(form$, documentReadOnly$).pipe(map(([form, readonly]) => !readonly && form.options?.useNamedPlaces && !this.document?.namedPlaceID));
  }

  openNamedPlacesChooserModal() {
    const form$ = this.formService.getForm(this.document.formID);
    if (!this.vm$) {
      this.vm$ = form$.pipe(map(form => ({form, document: this.document})));
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
    this.translate.get('np.linker.confirm').pipe(
      take(1),
      switchMap(txt => this.dialogService.confirm(txt)),
    ).subscribe(confirmed => {
      console.log('TODO');
    });
  }
}
