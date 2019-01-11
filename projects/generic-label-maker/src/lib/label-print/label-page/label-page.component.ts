import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { LabelItem, Setup } from '../../generic-label-maker.interface';

@Component({
  selector: 'll-label-page',
  templateUrl: './label-page.component.html',
  styleUrls: ['./label-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelPageComponent implements OnInit {

  @Input() setup: Setup;
  @Input() labelItems: LabelItem[][];
  @Input() data: object[];

  constructor() { }

  ngOnInit() {
  }

}
