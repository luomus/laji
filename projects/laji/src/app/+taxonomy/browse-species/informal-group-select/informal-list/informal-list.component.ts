import { Component, Input, Renderer2 } from '@angular/core';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type InformalTaxonGroup = components['schemas']['store-informalTaxonGroup'];

@Component({
    selector: 'laji-informal-list',
    templateUrl: './informal-list.component.html',
    styleUrls: ['./informal-list.component.scss'],
    standalone: false
})
export class InformalListComponent {
  @Input() informalTaxonGroups!: InformalTaxonGroup[];
  @Input() showAll = false;

  constructor(private renderer: Renderer2) {}

  onImgError(event: any) {
    this.renderer.setStyle(event.target, 'display', 'none');
  }
}
