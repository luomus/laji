import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy} from '@angular/core';
import {ProtaxApi} from './protax-api';
import {ExportService} from '../../shared/service/export.service';
import {TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs';
import {HttpEventType} from '@angular/common/http';

@Component({
  selector: 'laji-protax',
  templateUrl: './protax.component.html',
  styleUrls: ['./protax.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProtaxComponent implements OnDestroy {
  loading = false;
  downloadProgress: number;

  private analyseSub: Subscription;

  constructor(
    private protaxApi: ProtaxApi,
    private exportService: ExportService,
    private translate: TranslateService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnDestroy() {
    if (this.analyseSub) {
      this.analyseSub.unsubscribe();
    }
  }

  analyseData(formData: FormData) {
    if (this.analyseSub) {
      this.analyseSub.unsubscribe();
    }

    this.loading = true;
    this.downloadProgress = undefined;

    this.analyseSub = this.protaxApi.analyse(formData).subscribe(event => {
      if (event.type === HttpEventType.DownloadProgress) {
        this.downloadProgress = event.loaded / event.total;
      } else if (event.type === HttpEventType.Response) {
        this.exportService.exportArrayBuffer(event.body, 'protax_output', 'txt');
        this.loading = false;
      }
      this.cd.markForCheck();
    }, err => {
      if (err.status === 400) {
        alert(this.translate.instant('theme.protax.invalidSequence'));
      } else if (err.status === 413) {
        alert(this.translate.instant('theme.protax.tooLargeSequence'));
      } else {
        alert(this.translate.instant('theme.protax.genericError'));
      }
      this.loading = false;
      this.cd.markForCheck();
    });
  }
}
