import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, Input, Renderer2, ElementRef, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { FooterService } from 'src/app/shared/service/footer.service';
import { BaseDataService } from 'src/app/graph-ql/service/base-data.service';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'vir-taxon-dropdown',
  templateUrl: './taxon-dropdown.component.html',
  styleUrls: [
    './taxon-dropdown.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonDropdownComponent implements OnInit, OnDestroy {
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
