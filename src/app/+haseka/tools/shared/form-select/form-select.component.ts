import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit,
  Output
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { FormService } from '../../../../shared/service/form.service';

@Component({
  selector: 'laji-form-select',
  templateUrl: './form-select.component.html',
  styleUrls: ['./form-select.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormSelectComponent implements OnInit, OnDestroy {

  @Input() formID = '';
  @Output() selected = new EventEmitter<any>();

  formSub: Subscription;
  forms = [];

  constructor(
    private formService: FormService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.formSub = this.formService.getAllForms(this.translateService.currentLang)
      .map(forms => forms.sort((a, b) => a.title.localeCompare(b.title)))
      .subscribe(forms => {
        this.forms = forms;
        this.cdr.markForCheck();
      })
  }

  ngOnDestroy() {
    if (this.formSub) {
      this.formSub.unsubscribe();
    }
  }

  formSelected(id) {
    const forms = this.forms.filter(value => value.id === id);
    if (Array.isArray(forms) && forms.length === 1) {
      this.selected.emit(forms[0]);
    }
  }

}
