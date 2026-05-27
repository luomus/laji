import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import {
  ApiKeyRequest
} from '../../../../laji/src/app/shared-modules/download-modal/apikey-modal/apikey-modal.component';
import { Logger } from '../../../../laji/src/app/shared/logger';
import { VIR_FILTER_SHORTCUT_QUERY_PARAMS } from '../../../../laji/src/app/+observation/form/observation-form.component';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';

@Component({
    selector: 'vir-geoapi',
    templateUrl: './geoapi.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class GeoapiComponent {
  constructor(
    private logger: Logger,
    private cd: ChangeDetectorRef,
    private api: LajiApiClientService
  ) {}

  apiKey = '';
  apiKeyLoading = false;

  onApiKeyRequest(req: ApiKeyRequest) {
    this.apiKeyLoading = true;
    this.apiKey = '';
    // The endpoint is not documented by laji-api's OpenAPI document.
    this.api.post('/warehouse/query/download' as any, { query: {
      downloadFormat: 'TSV_FLAT',
      downloadIncludes: 'DOCUMENT_FACTS,GATHERING_FACTS,UNIT_FACTS',
      downloadType: 'AUTHORITIES_VIRVA_GEOAPI_KEY',
      dataUsePurpose: [req.reasonEnum, req.reason].filter(r => !!r).join(': '),
      apiKeyExpires: req.expiration,
      ...VIR_FILTER_SHORTCUT_QUERY_PARAMS,
    } }).subscribe(res => {
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
