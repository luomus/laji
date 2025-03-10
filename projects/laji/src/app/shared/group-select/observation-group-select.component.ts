import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef } from '@angular/core';
import { InformalTaxonGroupApi } from '../api/InformalTaxonGroupApi';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';
import { Logger } from '../logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { GroupSelectComponent } from './group-select.component';
import { InformalTaxonGroup } from '../model/InformalTaxonGroup';
import { PagedResult } from '../model/PagedResult';
import { RedListTaxonGroup } from '../model/RedListTaxonGroup';
import { ArrayResult } from '../model/ArrayResult';

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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationGroupSelectComponent extends GroupSelectComponent<InformalTaxonGroup> {

  constructor(
    protected cd: ChangeDetectorRef,
    protected informalTaxonService: InformalTaxonGroupApi,
    protected logger: Logger,
    protected translate: TranslateService
  ) {
    super(cd, logger, translate);
  }


  findById(groupId: string, lang: string | undefined): Observable<InformalTaxonGroup> {
    return this.informalTaxonService.informalTaxonGroupFindById(groupId, lang);
  }

  findByIds(groupIds: string[], lang: string | undefined): Observable<PagedResult<RedListTaxonGroup>> {
    return this.informalTaxonService.informalTaxonGroupFind(lang, undefined, undefined, groupIds);
  }

  getWithSiblings(groupId: string, lang: string | undefined): Observable<ArrayResult<RedListTaxonGroup>> {
    return this.informalTaxonService.informalTaxonGroupGetWithSiblings(groupId, lang);
  }

  getChildren(groupId: string, lang: string | undefined): Observable<ArrayResult<RedListTaxonGroup>> {
    return this.informalTaxonService.informalTaxonGroupGetChildren(groupId, lang);
  }

  findRoots(lang: string | undefined): Observable<ArrayResult<RedListTaxonGroup>> {
    return this.informalTaxonService.informalTaxonGroupFindRoots(lang);
  }

  convertToInformalTaxonGroup(group: RedListTaxonGroup): InformalTaxonGroup {
    return {...group};
  }


}
