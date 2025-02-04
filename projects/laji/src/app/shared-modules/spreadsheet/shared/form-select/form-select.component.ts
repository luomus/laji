import { catchError, map, mergeMap, switchMap, tap, toArray } from 'rxjs/operators';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { from, Observable, of } from 'rxjs';
import { FormService } from '../../../../shared/service/form.service';
import { FormPermissionService } from '../../../../shared/service/form-permission.service';

interface FormList {
  id: string;
  title: string;
  disabled: boolean;
}

@Component({
  selector: 'laji-form-select',
  templateUrl: './form-select.component.html',
  styleUrls: ['./form-select.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormSelectComponent {

  @Input() formID? = '';
  @Input() disabled = false;
  @Output() selected = new EventEmitter<any>();

  forms$: Observable<FormList[]> = of([]);
  loaded = false;
  _forms: string[] = [];

  constructor(
    private formService: FormService,
    private formPermissionService: FormPermissionService,
    private cdr: ChangeDetectorRef
  ) { }

  @Input()
  set forms(forms: string[]|null) {
    this._forms = Array.isArray(forms) ? forms : [];
    this.initForms();
  }

  get forms(): string[] {
    return this._forms;
  }

  private initForms() {
    if (this.forms.length === 0) {
      this.forms$ = of([]);
      return;
    }
    this.forms$ = from(this.forms).pipe(
      mergeMap(id => this.formService.getForm(id).pipe(
        switchMap(form => this.formPermissionService.hasAccessToForm(id).pipe(
          catchError(() => of(false)),
          map(permission => ({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            id: form!.id,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            title: form!.title,
            disabled: !permission
          }))
        ))
      )),
      toArray(),
      map(forms => forms.sort((a, b) => a.title.localeCompare(b.title))),
      tap((forms) => {
        if (forms.length === 1) {
          this.selected.emit(forms[0].id);
        }
        this.loaded = true;
        this.cdr.detectChanges();
      })
    );
  }

  formSelected(id: string) {
    this.selected.emit(id);
  }

}
