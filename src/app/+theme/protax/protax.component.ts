import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {ProtaxApi} from './protax-api';
import {ExportService} from '../../shared/service/export.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'laji-protax',
  templateUrl: './protax.component.html',
  styleUrls: ['./protax.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProtaxComponent implements OnInit {
  constructor(
    private protaxApi: ProtaxApi,
    private exportService: ExportService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
  }

  analyseData(formData: FormData) {
    this.protaxApi.analyse(formData).subscribe(result => {
      this.exportService.exportArrayBuffer(result, 'protax_output', 'txt');
    }, err => {
      if (err.status === 400) {
        alert(this.translate.instant('theme.protax.invalidSequence'));
      } else {
        alert(this.translate.instant('theme.protax.genericError'));
      }
    });
  }
}
