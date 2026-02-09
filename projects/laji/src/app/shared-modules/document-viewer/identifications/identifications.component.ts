import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
    selector: 'laji-identifications',
    templateUrl: './identifications.component.html',
    styleUrls: ['./identifications.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class IdentificationsComponent {
  @Input() identifications: any;
  @Input() showFacts = false;
}
