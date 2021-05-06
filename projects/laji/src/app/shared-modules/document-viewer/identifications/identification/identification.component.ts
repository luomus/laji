import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'laji-identification',
  templateUrl: './identification.component.html',
  styleUrls: ['./identification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationComponent {
  @Input() identification: any;
  @Input() showFacts = false;

  onTaxonLinkClick(event: MouseEvent) {
    event.stopPropagation();
  }
}
