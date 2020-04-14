import {
  Component, Output, Input, EventEmitter, ChangeDetectionStrategy, ViewChild, ElementRef, Renderer2, OnDestroy
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'lu-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxComponent implements OnDestroy{
  private unsubscribe$ = new Subject();
  @ViewChild('checkbox', {static: true}) checkbox: ElementRef;
  isChecked = false;

  /**
   * Set initial state of checkbox
   */
  @Input('checked') set checkedInput(checked: boolean) {
    this.isChecked = checked;
    this.checkbox.nativeElement.checked = checked;
  }

  @Input() disabled = false;

  /**
   * Changes to state of checkbox that were triggered by user
   */
  @Output() checked = new EventEmitter<boolean>();

  onInput(event: Event) {
    this.isChecked = event.target['checked'];
    this.checked.emit(event.target['checked']);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
