import { ChangeDetectionStrategy, Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { IGlobalRecordingResponse } from '../../../kerttu-global-shared/models';
import { KerttuGlobalApi } from '../../../kerttu-global-shared/service/kerttu-global-api';
import { UserService } from '../../../../../../laji/src/app/shared/service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { AudioService } from '../../../../../../laji/src/app/shared-modules/audio-viewer/service/audio.service';
import { SpectrogramService } from '../../../../../../laji/src/app/shared-modules/audio-viewer/service/spectrogram.service';

@Component({
  selector: 'bsg-identification-history-edit-modal',
  templateUrl: './identification-history-edit-modal.component.html',
  styleUrls: ['./identification-history-edit-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AudioService, SpectrogramService]
})
export class IdentificationHistoryEditModalComponent implements OnInit {
  @Input() siteId: number;
  @Input() recordingId: number;

  data: IGlobalRecordingResponse;

  constructor(
    private kerttuGlobalApi: KerttuGlobalApi,
    private userService: UserService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.kerttuGlobalApi.getRecording(
      this.userService.getToken(), this.translate.currentLang, [this.siteId], this.recordingId
    ).subscribe((result) => {
      this.data = result;
      this.cdr.markForCheck();
    });
  }

}
