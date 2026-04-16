import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';
import { Logger } from '../logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { GroupSelectComponent } from './group-select.component';
import { RedListTaxonGroupApi } from '../api/RedListTaxonGroupApi';
import { ArrayResult } from '../model/ArrayResult';
import { PagedResult } from '../model/PagedResult';
import { components } from 'projects/laji-api-client-b/generated/api';

type RedListTaxonGroup = components['schemas']['store-iucnRedListTaxonGroup'];
type InformalTaxonGroup = components['schemas']['store-informalTaxonGroup'];

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
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
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

  findById(groupId: string): Observable<InformalTaxonGroup> {
    return this.redListTaxonGroupApi.redListTaxonGroupsFindById(groupId ?? '');
  }

  findByIds(groupIds: string[]): Observable<PagedResult<RedListTaxonGroup>> {
    return this.redListTaxonGroupApi.redListTaxonGroupsFind(undefined, undefined, groupIds);
  }

  getWithSiblings(groupId: string): Observable<ArrayResult<RedListTaxonGroup>> {
    return this.redListTaxonGroupApi.redListTaxonGroupsGetWithSiblings(groupId ?? '');
  }

  getChildren(groupId: string): Observable<ArrayResult<RedListTaxonGroup>> {
    return this.redListTaxonGroupApi.redListTaxonGroupsGetChildren(groupId ?? '');
  }

  findRoots(): Observable<ArrayResult<RedListTaxonGroup>> {
    return this.redListTaxonGroupApi.redListTaxonGroupsFindRoots();
  }

  convertToInformalTaxonGroup(group: RedListTaxonGroup): InformalTaxonGroup {
    return {id: group.id, name: group.name, hasSubGroup: group.hasIucnSubGroup};
  }
}
