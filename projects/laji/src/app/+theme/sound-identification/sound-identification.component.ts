import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { SoundIdentificationApi, IdentificationData } from './sound-identification-api';
import { Subscription } from 'rxjs';
import { DialogService } from '../../shared/service/dialog.service';
import { CombinedData } from './sound-identification-form/sound-identification-form.component';

@Component({
  selector: 'laji-sound-identification',
  templateUrl: './sound-identification.component.html',
  styleUrls: ['./sound-identification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SoundIdentificationComponent implements OnDestroy {
  loading = false;
  maxAudioDuration = 60;
  acceptedFormats = [
    '.mp3',
    '.flac',
    '.wav',
  ];
  data?: IdentificationData[];

  private analyseSub: Subscription | undefined;

  constructor(
    private soundIdentificationApi: SoundIdentificationApi,
    private dialogService: DialogService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnDestroy() {
    if (this.analyseSub) {
      this.analyseSub.unsubscribe();
    }
  }

  analyseData(formData: CombinedData) {
    if (this.analyseSub) {
      this.analyseSub.unsubscribe();
    }

    this.loading = true;

    this.analyseSub = this.soundIdentificationApi.analyse(formData).subscribe(data => {
      this.data = data.sort((a, b) => {

        const starSort = a.start_time - b.start_time;

        if (starSort !== 0) {
          return starSort;
        }

        if (a.scientific_name < b.scientific_name) {
          return -1;
        } else if (a.scientific_name > b.scientific_name) {
          return 1;
        }

        return 0;
      });
      this.loading = false;

      this.cd.markForCheck();
    }, err => {
      this.loading = false;
      this.cd.markForCheck();

      if (err.status >= 400) {
        this.dialogService.alert('theme.soundIdentification.remoteError');
      } else {
        this.dialogService.alert('theme.soundIdentification.genericError');
      }
    });
  }
}
