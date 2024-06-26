import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, Renderer2, SimpleChanges } from '@angular/core';

export type AlertType = 'info' | 'warning' | 'success' | 'danger';

@Component({
  selector: 'lu-alert',
  template: `<ng-content></ng-content><button *ngIf="dismissible" class="dismiss" (click)="dismiss()">✕</button>`,
  styleUrls: ['./alert.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertComponent implements OnInit, OnChanges {
  @Input() type: AlertType = 'warning';
  @Input() dismissible = false;
  // for compat with ngx-bootstrap:
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onClose = new EventEmitter<void>();

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.renderer.addClass(this.el.nativeElement, this.type);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.type) {
      this.renderer.removeClass(this.el.nativeElement, changes.type.previousValue);
      this.renderer.addClass(this.el.nativeElement, changes.type.currentValue);
    }
    if (changes.dismissible) {
      if (changes.dismissible.currentValue) {
        this.renderer.addClass(this.el.nativeElement, 'dismissible');
      } else {
        this.renderer.removeClass(this.el.nativeElement, 'dismissible');
      }
    }
  }

  dismiss() {
    this.onClose.emit();
  }
}
