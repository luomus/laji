import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Label, LabelItem } from '../generic-label-maker.interface';
import { LabelService } from '../label.service';

@Component({
  selector: 'll-label-preview',
  templateUrl: './label-preview.component.html',
  styleUrls: ['./label-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelPreviewComponent implements OnInit {

  @Input() labelItem: LabelItem[] = [];
  @Input() label: Label;
  @Input() preview = true;

  init;

  constructor(labelService: LabelService) {
    this.init = labelService.hasRation();
  }

  ngOnInit() {
  }

}
