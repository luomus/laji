/* tslint:disable:no-use-before-declare */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef } from '@angular/core';
import { InformalTaxonGroupApi } from '../../shared/api/InformalTaxonGroupApi';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';
import { Logger } from '../../shared/logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { ExtendedGroupSelectComponent, InformalGroupEvent } from './extended-group-select.component';
import { InformalTaxonGroup } from '../../shared/model/InformalTaxonGroup';
import { PagedResult } from '../../shared/model/PagedResult';
import { RedListTaxonGroup } from '../../shared/model/RedListTaxonGroup';
import { ArrayResult } from '../../shared/model/ArrayResult';

export const OBSERVATION_GROUP_SELECT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ObservationExtendedGroupSelectComponent),
  multi: true
};

@Component({
  selector: 'laji-observation-extended-group-select',
  templateUrl: './extended-group-select.component.html',
  styleUrls: ['./extended-group-select.component.css'],
  providers: [OBSERVATION_GROUP_SELECT_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationExtendedGroupSelectComponent extends ExtendedGroupSelectComponent<InformalTaxonGroup> {

  constructor(
    protected cd: ChangeDetectorRef,
    protected informalTaxonService: InformalTaxonGroupApi,
    protected logger: Logger,
    protected translate: TranslateService
  ) {
    super(cd, logger, translate);
  }

  getOptions(): string[][] {
    return [this.query?.informalTaxonGroupId || [], this.query.informalTaxonGroupIdNot || []];
  }

  findByIds(groupIds: string[], lang: string): Observable<PagedResult<RedListTaxonGroup>> {
    return this.informalTaxonService.informalTaxonGroupFind(lang, undefined, undefined, groupIds);
  }

  convertToInformalTaxonGroup(group: InformalTaxonGroup): InformalTaxonGroup {
    return {...group};
  }

  getTree(lang: string): Observable<ArrayResult<InformalTaxonGroup>> {
    return this.informalTaxonService.informalTaxonGroupGetTree(lang);
  }

  prepareEmit(includedOptions: string[], excludedOptions?: string[]): InformalGroupEvent {
    return {
      informalTaxonGroupId: includedOptions,
      informalTaxonGroupIdNot: excludedOptions ?? [],
    };
  }
}
