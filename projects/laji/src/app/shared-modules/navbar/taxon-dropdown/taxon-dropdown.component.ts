import { Component, ChangeDetectionStrategy, OnInit, Input, Renderer2, ElementRef, OnDestroy, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'laji-taxon-dropdown',
  templateUrl: './taxon-dropdown.component.html',
  styleUrls: [
    './taxon-dropdown.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonDropdownComponent {
  @Input() omniSearchVisible: boolean;
}
