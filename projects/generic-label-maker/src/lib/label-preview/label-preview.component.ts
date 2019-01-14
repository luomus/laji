import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Setup } from '../generic-label-maker.interface';
import { LabelService } from '../label.service';

@Component({
  selector: 'll-label-preview',
  templateUrl: './label-preview.component.html',
  styleUrls: ['../../styles/ll-label.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelPreviewComponent implements OnInit {

  @Input() setup: Setup;
  @Input() preview = true;
  @Input() data: object;

  init;

  constructor(labelService: LabelService) {
    this.init = labelService.hasRation();
  }

  ngOnInit() {
  }

}
