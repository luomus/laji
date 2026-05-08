import { Component, Input } from '@angular/core';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type InformalTaxonGroup = components['schemas']['store-informalTaxonGroup'];

@Component({
    selector: 'laji-informal-list-breadcrumb',
    templateUrl: './informal-list-breadcrumb.component.html',
    styleUrls: ['./informal-list-breadcrumb.component.scss'],
    standalone: false
})

export class InformalListBreadcrumbComponent {
  @Input() informalGroup?: InformalTaxonGroup;
  @Input() parentGroup?: InformalTaxonGroup;
}
