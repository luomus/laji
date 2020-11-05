/* tslint:disable:no-use-before-declare */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';
import { Logger } from '../logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { GroupSelectComponent } from './group-select.component';
import { RedListTaxonGroup } from '../model/RedListTaxonGroup';
import { InformalTaxonGroup } from '../model/InformalTaxonGroup';
import { PagedResult } from '../model/PagedResult';
import { RedListTaxonGroupApi } from '../api/RedListTaxonGroupApi';

export const IUCN_GROUP_SELECT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => IucnGroupSelectComponent),
  multi: true
};

@Component({
  selector: 'laji-iucn-group-select',
  templateUrl: './group-select.component.html',
  styleUrls: ['./group-select.component.css'],
  providers: [IUCN_GROUP_SELECT_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IucnGroupSelectComponent extends GroupSelectComponent<RedListTaxonGroup> {

  constructor(
    protected cd: ChangeDetectorRef,
    protected redListTaxonGroupApi: RedListTaxonGroupApi,
    protected logger: Logger,
    protected translate: TranslateService
  ) {
    super(cd, logger, translate);
  }

  findById(groupId, lang): Observable<InformalTaxonGroup> {
    return this.redListTaxonGroupApi.redListTaxonGroupsFindById(groupId, lang);
  }

  getWithSiblings(groupId, lang): Observable<PagedResult<RedListTaxonGroup>> {
    return this.redListTaxonGroupApi.redListTaxonGroupsGetWithSiblings(groupId, lang);
  }

  getChildren(groupId, lang): Observable<PagedResult<RedListTaxonGroup>> {
    return this.redListTaxonGroupApi.redListTaxonGroupsGetChildren(groupId, lang);
  }

  findRoots(lang): Observable<PagedResult<RedListTaxonGroup>> {
    return this.redListTaxonGroupApi.redListTaxonGroupsFindRoots(lang);
  }

  convertToInformalTaxonGroup(group: RedListTaxonGroup): InformalTaxonGroup {
    return {id: group.id, name: group.name, hasSubGroup: group.hasIucnSubGroup};
  }
}
