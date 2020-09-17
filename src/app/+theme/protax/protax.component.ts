import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {ProtaxApi} from './protax-api';
import {ExportService} from '../../shared/service/export.service';

@Component({
  selector: 'laji-protax',
  templateUrl: './protax.component.html',
  styleUrls: ['./protax.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProtaxComponent implements OnInit {
  constructor(
    private protaxApi: ProtaxApi,
    private exportService: ExportService
  ) { }

  ngOnInit() {
  }

  analyseData(formData: FormData) {
    this.protaxApi.analyse(formData).subscribe(result => {
      this.exportService.exportArrayBuffer(result, 'protax_output', 'txt');
    });
  }
}
