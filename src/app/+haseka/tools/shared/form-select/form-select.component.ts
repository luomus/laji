import { catchError, map, mergeMap, switchMap, tap, toArray } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { from, Observable, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { FormService } from '../../../../shared/service/form.service';
import { FormPermissionService } from '../../../form-permission/form-permission.service';

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
export class FormSelectComponent implements OnInit {

  @Input() formID = '';
  @Input() disabled = false;
  @Output() selected = new EventEmitter<any>();

  forms$: Observable<FormList[]>;
  loaded = false;

  constructor(
    private formService: FormService,
    private translateService: TranslateService,
    private formPermissionService: FormPermissionService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.forms$ = from(environment.massForms || []).pipe(
      mergeMap(id => this.formService.getForm(id, this.translateService.currentLang).pipe(
        switchMap(form => this.formPermissionService.hasAccessToForm(id).pipe(
          catchError(() => of(false)),
          map(permission => ({
            id: form.id,
            title: form.title,
            disabled: !permission
          }))
        ))
      )),
      toArray(),
      map(forms => forms.sort((a, b) => a.title.localeCompare(b.title))),
      tap(() => {
        this.loaded = true;
        this.cdr.detectChanges();
      })
    );
  }

  formSelected(id) {
    this.selected.emit(id);
  }

}
