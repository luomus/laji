import { Component, Input } from '@angular/core';
import { AccessLevel } from '../request.component';

@Component({
    selector: 'laji-request-description',
    template: `
    <p *ngIf="accessLevel === AccessLevel.Allowed">{{'form.permission.allowed' | translate}}</p>
    <p *ngIf="accessLevel === AccessLevel.Requested">{{'form.permission.requested' | translate}}</p>
    <p *ngIf="accessLevel === AccessLevel.NotRequested">{{'form.permission.notRequested' | translate}}</p>
    `
})
export class RequestDescriptionComponent {
    AccessLevel = AccessLevel;

    @Input() accessLevel: AccessLevel;
}
