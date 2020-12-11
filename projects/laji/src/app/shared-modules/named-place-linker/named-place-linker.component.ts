import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormService } from '../../shared/service/form.service';
import { Form } from '../../shared/model/Form';
import { map } from 'rxjs/operators';
import { combineLatest, Observable, of } from 'rxjs';
import { Document } from '../../shared/model/Document';

interface ViewModel {
  document: Document;
  form: Form.List;
}

interface NamedPlaceViewModel {
  documentForm: Form.SchemaForm;
}

@Component({
  selector: 'laji-named-place-linker',
  templateUrl: './named-place-linker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NamedPlaceLinkerComponent implements OnInit {
  @Input() document: Document;

  vm$: Observable<ViewModel>;
  npVm$: Observable<NamedPlaceViewModel>;

  municipality: string;
  birdAssociationArea: string;
  tags: string[];
  activeNP: string;

  @ViewChild('modal', {static: true}) public modal: ModalDirective;

  constructor(
    private formService: FormService
  ) { }

  ngOnInit(): void {
    const form$ = this.formService.getAllForms().pipe(map(forms => forms.find(f => f.id === this.document.formID)));
    const doc$ = of(this.document);
    this.vm$ = combineLatest(form$, doc$)
      .pipe(map(([form, document]) => ({form, document})));
  }

  openNamedPlacesChooserModal() {
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
  }
}
