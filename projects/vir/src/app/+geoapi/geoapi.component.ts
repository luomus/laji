import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import {
  ApiKeyRequest
} from '../../../../laji/src/app/shared-modules/download-modal/apikey-modal/apikey-modal.component';
import { UserService } from '../../../../laji/src/app/shared/service/user.service';
import { WarehouseApi } from '../../../../laji/src/app/shared/api/WarehouseApi';
import { Logger } from '../../../../laji/src/app/shared/logger';
import { TranslateService } from '@ngx-translate/core';
import { VIR_FILTER_SHORTCUT_QUERY_PARAMS } from '../../../../laji/src/app/+observation/form/observation-form.component';
import { SearchQueryService } from '../../../../laji/src/app/+observation/search-query.service';

@Component({
  selector: 'vir-geoapi',
  templateUrl: './geoapi.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeoapiComponent {
  constructor(
    private warehouseService: WarehouseApi,
    private searchQueryService: SearchQueryService,
    private userService: UserService,
    private logger: Logger,
    private translate: TranslateService,
    private cd: ChangeDetectorRef
  ) {}

  apiKey?: string;
  apiKeyLoading = false;

  onApiKeyRequest(req: ApiKeyRequest) {
    this.apiKeyLoading = true;
    this.apiKey = '';
    this.warehouseService.download(
      this.userService.getToken(),
      'TSV_FLAT',
      'DOCUMENT_FACTS,GATHERING_FACTS,UNIT_FACTS',
      this.searchQueryService.getQueryFromUrlQueryParams(VIR_FILTER_SHORTCUT_QUERY_PARAMS),
      this.translate.currentLang,
      'AUTHORITIES_VIRVA_GEOAPI_KEY',
      {
        dataUsePurpose: [req.reasonEnum, req.reason].filter(r => !!r).join(': '),
        apiKeyExpires: req.expiration
      }
    ).subscribe(res => {
      this.apiKeyLoading = false;
      this.apiKey = res.apiKey;
      this.cd.markForCheck();
    }, err => {
      this.logger.error('Apikey request failed', err);
      this.apiKeyLoading = false;
      this.apiKey = '';
      this.cd.markForCheck();
    });
  }
}
