import { Component, Input } from '@angular/core';
import { AccessLevel } from '../request.component';

@Component({
    selector: 'laji-request-description',
    template: `
    @if (accessLevel === AccessLevel.Allowed) {
      <p>{{ 'form.permission.allowed' | translate }}</p>
    }
    @if (accessLevel === AccessLevel.Requested) {
      <p>{{ 'form.permission.requested' | translate }}</p>
    }
    @if (accessLevel === AccessLevel.NotRequested) {
      <p>{{ 'form.permission.notRequested' | translate }}</p>
    }
    `,
    standalone: false
})
export class RequestDescriptionComponent {
    AccessLevel = AccessLevel; // eslint-disable-line @typescript-eslint/naming-convention

    @Input() accessLevel!: AccessLevel;
}
