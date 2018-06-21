import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'laji-year-slider',
  templateUrl: './year-slider.component.html',
  styleUrls: ['./year-slider.component.css']
})
export class YearSliderComponent implements OnInit {
  @Input() year: string;
  @Input() yearInfo: any[];
  @Input() showCounts = true;
  selectList: {year: number, count: number}[] = [];

  pcsString: string;
  pcString: string;
  subTrans: Subscription;

  @Output() onRangeChange = new EventEmitter();

  @ViewChild('sliderRef') sliderRef;

  constructor(
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.updateTranslations();
  }

  yearSelectChange(val: string) {
    this.onRangeChange.emit(parseInt(val, 10));
  }

  private updateTranslations() {
    this.pcString = this.translate.instant('haseka.submissions.pcs.singular');
    this.pcsString = this.translate.instant('haseka.submissions.pcs');
  }
}
