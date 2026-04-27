import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';
import { Logger } from '../logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { GroupSelectComponent } from './group-select.component';
import { components, operations } from 'projects/laji-api-client-b/generated/api';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';

type RedListTaxonGroup = components['schemas']['store-iucnRedListTaxonGroup'];
type InformalTaxonGroup = components['schemas']['store-informalTaxonGroup'];

type RedListEvaluationGroupGetResponse = operations['RedListEvaluationGroupsController_get']['responses'][200]['content']['application/json'];
type RedListEvaluationGroupGetPageResponse = operations['RedListEvaluationGroupsController_getPage']['responses'][200]['content']['application/json'];
type RedListEvaluationGroupGetSiblingsResponse = operations['RedListEvaluationGroupsController_getSiblings']['responses'][200]['content']['application/json'];
type RedListEvaluationGroupGetChildrenResponse = operations['RedListEvaluationGroupsController_getChildren']['responses'][200]['content']['application/json'];
type RedListEvaluationGroupGetRootsResponse = operations['RedListEvaluationGroupsController_getRoots']['responses'][200]['content']['application/json'];

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
    protected api: LajiApiClientBService,
    protected logger: Logger,
    protected translate: TranslateService
  ) {
    super(cd, logger, translate);
  }

  findById(groupId: string): Observable<RedListEvaluationGroupGetResponse> {
    return this.api.get('/red-list-evaluation-groups/{id}', { path: { id: groupId } });
  }

  findByIds(groupIds: string[]): Observable<RedListEvaluationGroupGetPageResponse> {
    return this.api.get('/red-list-evaluation-groups', { query: { idIn: groupIds.join(',') } });
  }

  getWithSiblings(groupId: string): Observable<RedListEvaluationGroupGetSiblingsResponse> {
    return this.api.get('/red-list-evaluation-groups/{id}/siblings', { path: { id: groupId } });
  }

  getChildren(groupId: string): Observable<RedListEvaluationGroupGetChildrenResponse> {
    return this.api.get('/red-list-evaluation-groups/{id}/children', { path: { id: groupId } });
  }

  findRoots(): Observable<RedListEvaluationGroupGetRootsResponse> {
    return this.api.get('/red-list-evaluation-groups/roots');
  }

  convertToInformalTaxonGroup(group: RedListTaxonGroup): InformalTaxonGroup {
    return {id: group.id!, name: group.name, hasSubGroup: group.hasIucnSubGroup};
  }
}
