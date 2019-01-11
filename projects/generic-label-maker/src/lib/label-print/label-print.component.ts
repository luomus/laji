import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LabelField, LabelItem, Setup } from '../generic-label-maker.interface';
import { LabelService } from '../label.service';

@Component({
  selector: 'll-label-print',
  templateUrl: './label-print.component.html',
  styleUrls: ['./label-print.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelPrintComponent implements OnInit {


  @Input() setup: Setup;
  @Input() data: object[];
  @Input() labelButton = 'PDF';
  // tslint:disable-next-line:no-input-rename
  @Input('class') btnClass = 'btn btn-default';

  @Output() click = new EventEmitter<void>();

  pages: object[][] = [];

  constructor(private labelService: LabelService) { }

  ngOnInit() {
  }


  btnClick(event: MouseEvent) {
    event.preventDefault();
    this.click.emit();
    const dim = this.labelService.countLabelsPerPage(this.setup);
    const perPage = dim.rows * dim.rows;
    const pages = [];
    let page = [];
    this.data.forEach((item, idx) => {
      if (idx % perPage === 0 && page.length > 0) {
        pages.push([...page]);
        page = [];
      }
      page.push(item);
    });
    if (page.length > 0) {
      pages.push([...page]);
    }
    this.pages = pages;
  }
}
