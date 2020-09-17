import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {ProtaxApi} from './protax-api';
import {ExportService} from '../../shared/service/export.service';
import {ProtaxModelEnum} from './models';

@Component({
  selector: 'laji-protax',
  templateUrl: './protax.component.html',
  styleUrls: ['./protax.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProtaxComponent implements OnInit {
  model: ProtaxModelEnum = ProtaxModelEnum.COIFull;
  probabilityThreshold = 0.1;
  sequenceData = '';

  protaxModels = ProtaxModelEnum;

  constructor(
    private protaxApi: ProtaxApi,
    private exportService: ExportService
  ) { }

  ngOnInit() {
  }

  analyseData() {
    this.protaxApi.analyse(this.sequenceData, this.model, this.probabilityThreshold).subscribe(result => {
      this.exportService.exportArrayBuffer(result, 'protax_output', 'txt');
    });
  }
}
