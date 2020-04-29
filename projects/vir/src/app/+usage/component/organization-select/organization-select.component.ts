import { Component, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { IColOrganization, VirOrganisationService } from '../../../service/vir-organisation.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'vir-organization-select',
  templateUrl: './organization-select.component.html',
  styleUrls: ['./organization-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationSelectComponent {

  private organisations: IColOrganization[];

  readonly organisations$ = this.virOrganisationService.organisations$.pipe(
      tap(data => this.organisations = data)
  );

  @Output() select = new EventEmitter<undefined|IColOrganization>();

  constructor(
      private virOrganisationService: VirOrganisationService
  ) {}

  test(event) {
    this.select.emit(this.organisations.find((org) => org.id === event));
  }
}
