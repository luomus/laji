import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { DialogService } from '../../../shared/service/dialog.service';
import { toHtmlInputElement } from '../../../shared/service/html-element.service';
import { from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface CombinedData {
  params: {[key: string]: any};
  formData: FormData;
}

@Component({
  selector: 'laji-sound-identification-form',
  templateUrl: './sound-identification-form.component.html',
  styleUrls: ['./sound-identification-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SoundIdentificationFormComponent implements OnChanges {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  @Input() loading = false;
  @Input() maxAudioDuration!: number;
  @Input() acceptedFormats!: string[];

  probabilityThreshold = 0.5;
  overlap = 1;
  includeSdm = false;
  date?: string;
  longitude?: number;
  latitude?: number;
  audioFile: File | undefined | null;
  isValidating = false;

  @Output() soundIdentificationSubmit = new EventEmitter<CombinedData>();

  constructor(
    private dialogService: DialogService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.loading && changes.loading.previousValue) {
      this.fileInput.nativeElement.value = '';
    }
  }

  toggleIncludeSdm() {
    this.includeSdm = !this.includeSdm;
  }

  onFileInput($event: Event) {
    this.audioFile = toHtmlInputElement($event.target).files!.item(0);
  }

  submitForm() {
    if (this.probabilityThreshold == null || this.probabilityThreshold < 0.1 || this.probabilityThreshold > 1) {
      this.dialogService.alert('theme.soundIdentification.invalidThreshold');
      return;
    }
    if (this.overlap == null || this.overlap < 0 || this.overlap > 2) {
      this.dialogService.alert('theme.soundIdentification.invalidOverlap');
      return;
    }

    if (this.includeSdm) {
      if (this.latitude == null || this.latitude < -90 || this.latitude > 90) {
        this.dialogService.alert('theme.soundIdentification.invalidLatitude');
        return;
      }
      if (this.longitude == null || this.longitude < -180 || this.longitude > 180) {
        this.dialogService.alert('theme.soundIdentification.invalidLongitude');
        return;
      }
    }

    if (!this.audioFile) {
      this.dialogService.alert('theme.soundIdentification.audioFile');
      return;
    }

    if(!this.isValidAudioFormat(this.audioFile)) {
      this.dialogService.alert('theme.soundIdentification.invalidFormat');
      return;
    }

      this.isValidating = true;

      this.getAudioDuration(this.audioFile).subscribe(
        duration => {
          if (duration > this.maxAudioDuration) {
            this.dialogService.alert('theme.soundIdentification.invalidDuration');
            return;
          }

          this.soundIdentificationSubmit.emit(this.getFormAndParamsData());
        },
        () => {
          this.dialogService.alert(`theme.soundIdentification.audioError`);
        },
        () => {this.isValidating = false;}
      );
  }

  private getDayOfYearFromDate(dateString: string): number {
    const date = new Date(dateString);
    const currentDateUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    const startOfYearUTC = Date.UTC(date.getFullYear(), 0, 0);

    return Math.ceil(currentDateUTC - startOfYearUTC) / (24 * 60 * 60 * 1000);
  }

  private isValidAudioFormat(file: File): boolean {
    return this.acceptedFormats.some(format => file.name.toLowerCase().endsWith(format));
  }
  private getAudioDuration(file: File): Observable<number> {
    return from(file.arrayBuffer()).pipe(
      switchMap((audioBuffer: ArrayBuffer) => {
        const ctx = new AudioContext();
        return from(ctx.decodeAudioData(audioBuffer)).pipe(
          map((audioData: AudioBuffer) => audioData.duration));
      })
    );
  }

  private getFormAndParamsData(): CombinedData {
    const formData = new FormData();
    const params: {[key: string]: any} = {};
    const audioData = <Blob><unknown>this.audioFile;

    formData.append('file', audioData, this.audioFile!.name);
    params['threshold'] = this.probabilityThreshold;
    params['overlap'] = this.overlap;

    if (this.includeSdm) {
      params['include_sdm'] = this.includeSdm;
      params['latitude'] = this.latitude;
      params['longitude'] = this.longitude;

      if (this.date) {
        params['day_of_year'] = this.getDayOfYearFromDate(this.date);
      }
    }

    return {
      params,
      formData
    };
  }
}
