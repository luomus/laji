import { catchError, map, mergeMap, switchMap, tap, toArray } from 'rxjs/operators';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input, OnChanges,
  Output, SimpleChanges
} from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { FormService } from '../../../../shared/service/form.service';
import { FormPermissionService } from '../../../../shared/service/form-permission.service';
import { PlatformService } from '../../../../root/platform.service';

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
export class FormSelectComponent implements OnChanges{
  @Input() forms?: string[] | null;
  @Input() formID? = '';
  @Input() disabled = false;
  @Output() selected = new EventEmitter<any>();

  forms$: Observable<FormList[]> = of([]);
  loaded = false;

  constructor(
    private formService: FormService,
    private formPermissionService: FormPermissionService,
    private platformService: PlatformService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.forms) {
      this.initForms();
    }
  }

  private initForms() {
    if (!this.platformService.isBrowser) {
      return;
    }

    if (!this.forms?.length) {
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
