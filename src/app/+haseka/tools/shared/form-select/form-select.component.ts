import { map, mergeMap, tap, toArray } from 'rxjs/operators';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { from, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { FormService } from '../../../../shared/service/form.service';

interface FormList {
  id: string;
  title: string;
}

@Component({
  selector: 'laji-form-select',
  templateUrl: './form-select.component.html',
  styleUrls: ['./form-select.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormSelectComponent implements OnInit {

  @Input() formID = '';
  @Input() disabled = false;
  @Output() selected = new EventEmitter<any>();

  forms$: Observable<FormList[]>;
  loaded = false;

  constructor(
    private formService: FormService,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
    this.forms$ = from(environment.massForms).pipe(
      mergeMap((formID) => this.formService.getForm(formID, this.translateService.currentLang).pipe(
        map(form => ({id: form.id, title: form.title}))
      )),
      toArray(),
      map(forms => forms.sort((a, b) => a.title.localeCompare(b.title))),
      tap(() => this.loaded = true)
    );
  }

  formSelected(id) {
    console.log('SELECTING FORM', id);
    this.selected.emit(id);
  }

}
