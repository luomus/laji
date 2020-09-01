import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, Input, Renderer2, ElementRef, OnDestroy, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'vir-usage-dropdown',
  templateUrl: './usage-dropdown.component.html',
  styleUrls: [
    './usage-dropdown.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsageDropdownComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();
  private destroyListener;
  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}
  ngOnInit() {
    this.destroyListener = this.renderer.listen(this.elementRef.nativeElement, 'click', (e) => {
      e.stopPropagation();
    });
  }
  onClose() {
    this.close.emit();
  }
  ngOnDestroy() {
    if (this.destroyListener) {
      this.destroyListener();
    }
  }
}
