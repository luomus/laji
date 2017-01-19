import {
  Component, OnInit, Input, OnChanges, ViewContainerRef, ViewChild, AfterViewInit,
  ViewRef, ViewEncapsulation, AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { type } from 'os';

@Component({
  selector: 'laji-row',
  templateUrl: './row.component.html',
  styleUrls: ['./row.component.css']
})
export class RowComponent implements OnInit, OnChanges, AfterViewInit {

  @ViewChild('valueRow') valueRow;
  @Input() item: any = {};
  @Input() title: string;
  @Input() field: string;
  @Input() valueIsLabel = true;

  public _title = '';
  public _show = true;
  private checked = false;

  constructor(private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.initRow();
  }

  ngOnChanges() {
    this.initRow();
  }

  ngAfterViewInit() {
    if (!this.checked) {
      console.log(this.valueRow.nativeElement.innerText);
      this._show = this.valueRow.nativeElement.innerText.trim().length > 0;
      this.checked = false;
      this.cd.detectChanges();
    }
  }

  initRow() {
    this._title = this.title || this.field || '';
  }

}
