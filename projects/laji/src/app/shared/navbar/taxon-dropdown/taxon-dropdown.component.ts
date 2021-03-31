import { Component, ChangeDetectionStrategy, OnInit, Input, Renderer2, ElementRef, OnDestroy, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'laji-taxon-dropdown',
  templateUrl: './taxon-dropdown.component.html',
  styleUrls: [
    './taxon-dropdown.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonDropdownComponent implements OnInit, OnDestroy {
  @Input() visible: boolean;
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
