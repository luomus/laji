import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import {
  ApiKeyRequest
} from '../../../../laji/src/app/shared-modules/download-modal/apikey-modal/apikey-modal.component';
import { VirGeoapiService } from '../service/vir-geoapi.service';
import { UserService } from '../../../../laji/src/app/shared/service/user.service';

@Component({
  selector: 'vir-geoapi',
  templateUrl: './geoapi.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeoapiComponent {
  constructor(
    private geoapiService: VirGeoapiService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  apiKey?: string;
  apiKeyLoading = false;

  onApiKeyRequest(request: ApiKeyRequest) {
    this.apiKeyLoading = true;

    this.geoapiService.requestApiKey(
      [request.reasonEnum, request.reason].filter(r => !!r).join(': '),
      request.expiration
    ).subscribe((result) => {
      this.apiKey = result.apiKey;
      this.apiKeyLoading = false;
      this.cdr.markForCheck();
    }, () => {
      this.apiKeyLoading = false;
      this.cdr.markForCheck();
    });
  }
}
