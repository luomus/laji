import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';
import { Logger } from '../logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { GroupSelectComponent } from './group-select.component';
import { components, operations } from 'projects/laji-api-client-b/generated/api';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';

type InformalTaxonGroup = components['schemas']['store-informalTaxonGroup'];
type RedListTaxonGroup= components['schemas']['store-iucnRedListTaxonGroup'];

type InformalTaxonGroupGetResponse = operations['InformalTaxonGroupsController_get']['responses'][200]['content']['application/json'];
type InformalTaxonGroupGetPageResponse = operations['InformalTaxonGroupsController_getPage']['responses'][200]['content']['application/json'];
type InformalTaxonGroupGetSiblingsResponse = operations['InformalTaxonGroupsController_getSiblings']['responses'][200]['content']['application/json'];
type InformalTaxonGroupGetChildrenResponse = operations['InformalTaxonGroupsController_getChildren']['responses'][200]['content']['application/json'];
type InformalTaxonGroupGetRootsResponse = operations['InformalTaxonGroupsController_getRoots']['responses'][200]['content']['application/json'];

export const OBSERVATION_GROUP_SELECT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ObservationGroupSelectComponent),
  multi: true
};

@Component({
    selector: 'laji-observation-group-select',
    templateUrl: './group-select.component.html',
    styleUrls: ['./group-select.component.css'],
    providers: [OBSERVATION_GROUP_SELECT_VALUE_ACCESSOR],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ObservationGroupSelectComponent extends GroupSelectComponent<InformalTaxonGroup> {

  constructor(
    protected cd: ChangeDetectorRef,
    protected api: LajiApiClientBService,
    protected logger: Logger,
    protected translate: TranslateService
  ) {
    super(cd, logger, translate);
  }


  findById(groupId: string): Observable<InformalTaxonGroupGetResponse> {
    return this.api.get('/informal-taxon-groups/{id}', { path: { id: groupId } });
  }

  findByIds(groupIds: string[]): Observable<InformalTaxonGroupGetPageResponse> {
    return this.api.get('/informal-taxon-groups', { query: { idIn: groupIds.join(',') } });
  }

  getWithSiblings(groupId: string): Observable<InformalTaxonGroupGetSiblingsResponse> {
    return this.api.get('/informal-taxon-groups/{id}/siblings', { path: { id: groupId } });
  }

  getChildren(groupId: string): Observable<InformalTaxonGroupGetChildrenResponse> {
    return this.api.get('/informal-taxon-groups/{id}/children', { path: { id: groupId } });
  }

  findRoots(): Observable<InformalTaxonGroupGetRootsResponse> {
    return this.api.get('/informal-taxon-groups/roots');
  }

  convertToInformalTaxonGroup(group: RedListTaxonGroup): InformalTaxonGroup {
    return {...group, id: group.id!};
  }
}
