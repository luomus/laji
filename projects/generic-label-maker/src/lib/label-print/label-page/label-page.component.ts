import { AfterViewInit, ChangeDetectionStrategy, Component, Input, EventEmitter, Output } from '@angular/core';
import { LabelItem, Setup } from '../../generic-label-maker.interface';
import { PageLayout } from '../../label.service';

@Component({
  selector: 'll-label-page',
  templateUrl: './label-page.component.html',
  styleUrls: ['../../../styles/ll-label.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelPageComponent implements AfterViewInit {

  @Input() setup: Setup;
  @Input() labelItems: LabelItem[][];
  @Input() data: object[];

  @Output() ready = new EventEmitter<void>();

  cols = '';
  rows = '';

  constructor() { }

  ngAfterViewInit() {
    // QRCodes will not be included if there is no setTimeout here
    setTimeout(() => {
      this.ready.emit();
    });
  }

  @Input()
  set pageLayout(dim: PageLayout) {
    this.cols = Array(dim.cols).fill('1fr').join(' ');
    this.rows = Array(dim.rows).fill('1fr').join(' ');
  }

}
