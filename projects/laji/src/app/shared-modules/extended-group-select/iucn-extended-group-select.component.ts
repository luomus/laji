/* tslint:disable:no-use-before-declare */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';
import { Logger } from '../../shared/logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { ExtendedGroupSelectComponent } from './extended-group-select.component';
import { RedListTaxonGroup } from '../../shared/model/RedListTaxonGroup';
import { InformalTaxonGroup } from '../../shared/model/InformalTaxonGroup';
import { PagedResult } from '../../shared/model/PagedResult';
import { RedListTaxonGroupApi } from '../../shared/api/RedListTaxonGroupApi';

export const IUCN_GROUP_SELECT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => IucnExtendedGroupSelectComponent),
  multi: true
};

@Component({
  selector: 'laji-iucn-extended-group-select',
  templateUrl: './extended-group-select.component.html',
  styleUrls: ['./extended-group-select.component.css'],
  providers: [IUCN_GROUP_SELECT_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IucnExtendedGroupSelectComponent extends ExtendedGroupSelectComponent<RedListTaxonGroup> {

  constructor(
    protected cd: ChangeDetectorRef,
    protected redListTaxonGroupApi: RedListTaxonGroupApi,
    protected logger: Logger,
    protected translate: TranslateService
  ) {
    super(cd, logger, translate);
  }

  redList = true;

  getOptions(): string[][] {
    return [this.query?.redListGroup || [], []];
  }

  findByIds(groupIds, lang): Observable<PagedResult<RedListTaxonGroup>> {
    return this.redListTaxonGroupApi.redListTaxonGroupsFind(lang, undefined, undefined, {idIn: groupIds});
  }

  convertToInformalTaxonGroup(group: RedListTaxonGroup): InformalTaxonGroup {
    return {id: group.id, name: group.name, hasSubGroup: group.hasIucnSubGroup};
  }

  getTree(lang: any): Observable<PagedResult<RedListTaxonGroup>> {
    return this.redListTaxonGroupApi.redListTaxonGroupsGetTree(lang);
  }

  prepareEmit(includedOptions: string[], excludedOptions?: string[]) {
    return {
      redListGroup: includedOptions,
    };
  }
}
