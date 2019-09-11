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
  unsubscribe$ = new Subject();
  @ViewChild('checkbox', {static: true}) checkbox: ElementRef;

  /**
   * Set initial state of checkbox
   */
  @Input() set init(checked: boolean) {
    this.checkbox.nativeElement.checked = checked;
  }
  /**
   * Observable of changes to initial state of checkbox
   */
  @Input() set init$(observable: Observable<boolean>) {
    this.unsubscribe$.next();
    observable.pipe(takeUntil(this.unsubscribe$)).subscribe((checked) => {
      this.checkbox.nativeElement.checked = checked;
    });
  }
  /**
   * Changes to state of checkbox that were triggered by user
   */
  @Output() checked = new EventEmitter<boolean>();

  onInput(event: Event) {
    this.checked.emit(event.target['checked']);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
