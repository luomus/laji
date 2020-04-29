import { Component, ChangeDetectionStrategy } from '@angular/core';
import {
  IColOrganization,
  IOrganizationPerson,
  VirOrganisationService
} from '../../../service/vir-organisation.service';
import { TranslateService } from '@ngx-translate/core';

interface IPersonTableData extends IOrganizationPerson {
  organisation: string;
}

@Component({
  selector: 'laji-usage-by-person',
  templateUrl: './usage-by-person.component.html',
  styleUrls: ['./usage-by-person.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsageByPersonComponent {

  organisation: IColOrganization;
  users: IPersonTableData[];

  constructor(
      private virOrganisationService: VirOrganisationService,
      private translateService: TranslateService
  ) {}

  organizationSelect(org: IColOrganization) {
    this.organisation = org;
    const persons: IPersonTableData[] = [];
    this.extractPersons(org, persons);
    this.users = persons;
  }

  private extractPersons(org: IColOrganization, persons: IPersonTableData[], parent = ''): void {
    const lang = this.translateService.currentLang;
    const name = org.collectionName && org.collectionName[lang] || '';
    if (org.person) {
      org.person.forEach(p => {
        persons.push({
          ...p,
          organisation: parent ? parent + ' / ' + name : name
        });
      })
    }
    if (org.children) {
      org.children.forEach(c => this.extractPersons(c, persons, name))
    }
  }
}
