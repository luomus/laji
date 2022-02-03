import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { IAudio } from '../../../../../laji/src/app/shared-modules/audio-viewer/models';
import { KerttuGlobalApi } from '../../kerttu-global-shared/service/kerttu-global-api';
import { UserService } from '../../../../../laji/src/app/shared/service/user.service';

@Component({
  selector: 'bsg-recording-identification',
  templateUrl: './recording-identification.component.html',
  styleUrls: ['./recording-identification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecordingIdentificationComponent implements OnInit {
  recording: IAudio;

  loading = false;
  firstRecordingLoaded = false;
  hasError = false;

  constructor(
    private kerttuGlobalApi: KerttuGlobalApi,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loading = true;
    this.kerttuGlobalApi.getRecordingForIdentification(this.userService.getToken()).subscribe((result) => {
      this.recording = result;
      this.firstRecordingLoaded = true;
      this.loading = false;
      this.cdr.markForCheck();
    }, (err) => {
      this.hasError = true;
      this.loading = false;
      this.cdr.markForCheck();
    });
  }
}
